import * as fs from 'fs/promises';
import * as path from 'path';

import { Injectable } from '@nestjs/common';

import { FileService } from '@core-module/file-service';
import { TemporalFileService } from '@core-module/temporal-file';
import { FfmpegHlsService } from '@domain/ffmpeg/services/ffmpeg-hls';
import { FfmpegProgressService } from '@domain/ffmpeg/services/ffmpeg-progress';
import { FfmpegResolutionService } from '@domain/ffmpeg/services/ffmpeg-resolution';
import { VariantPaths } from '@domain/ffmpeg/types';
import { CleanupTempFilesInputObject, CompressVideoParams, FfmpegCanceledException, HlsConversionInputObject } from '@domain/ffmpeg/types';
import Ffmpeg from 'fluent-ffmpeg';
import { MemoryStoredFile } from 'nestjs-form-data';

import { COMPRESSION_OPTIONS, RESOLUTIONS } from './constants';

enum FileExtension {
  M3U8 = 'm3u8',
}

@Injectable()
class FfmpegService {
  public constructor(
    private readonly temporalFileService: TemporalFileService,
    private readonly ffmpegProgressService: FfmpegProgressService,
    private readonly ffmpegHlsService: FfmpegHlsService,
    private readonly ffmpegResolutionService: FfmpegResolutionService,
    private readonly fileService: FileService,
  ) {}

  public async convertToHls(inputObject: HlsConversionInputObject): Promise<MemoryStoredFile> {
    const { file, jobId, originalMetadata } = inputObject;

    const filenameWithoutExtension = this.fileService.getFilenameWithoutExtension(file.originalName);
    const outputFilename = `${filenameWithoutExtension}.${FileExtension.M3U8}`;

    const filePrefix = `hls-${jobId}`;

    const workDir = await this.temporalFileService.getJobWorkingDirectory(jobId);

    const inputPath = path.join(workDir, `${filePrefix}-input.${file.extension || 'mp4'}`);
    const compressedPath = path.join(workDir, `${filePrefix}-compressed.mp4`);
    const outputPath = path.join(workDir, `${filePrefix}-master.m3u8`);

    await fs.writeFile(inputPath, file.buffer);

    const sourceHeight = this.ffmpegResolutionService.getSourceHeight(originalMetadata?.height);
    const resolutionsToConvert = RESOLUTIONS.filter((res) => res.height <= sourceHeight);

    const totalSteps = 1 + resolutionsToConvert.length;
    const progressStep = 100 / totalSteps;

    await this.compressVideoFile({
      inputPath,
      outputPath: compressedPath,
      jobId,
      progressStep,
    });

    const versionsDir = path.join(workDir, `${filePrefix}-versions`);

    await fs.mkdir(versionsDir, { recursive: true });

    const variantPaths: VariantPaths[] = [];
    const cleanupPromises: Promise<void>[] = [];

    await this.ffmpegHlsService.createHlsVariants({
      resolutionsToConvert,
      compressedPath,
      versionsDir,
      jobId,
      progressStep,
      variantPaths,
      cleanupPromises,
    });

    await this.ffmpegHlsService.createMasterPlaylist({
      outputPath,
      variantPaths,
    });

    const result = await this.ffmpegHlsService.prepareResult({
      outputPath,
      outputFilename,
      variantPaths,
    });

    await Promise.all(cleanupPromises);

    await fs.rm(workDir, { recursive: true, force: true });

    return result;
  }

  private async compressVideoFile(params: CompressVideoParams): Promise<void> {
    const { inputPath, outputPath, jobId, progressStep } = params;

    return new Promise((resolve, reject) => {
      const command = Ffmpeg(inputPath)
        .outputOptions(COMPRESSION_OPTIONS)
        .on('progress', (progress) => {
          const percent = progress.percent || 0;
          const progressPercentage = (percent / 100) * progressStep;

          this.ffmpegProgressService.updateProgress(jobId, {
            ...progress,
            progress: progressPercentage,
          });
        })
        .on('error', (err) => {
          console.error('Ошибка при компрессии:', err);

          if (err.message && err.message.includes('Exiting normally, received signal 15')) {
            reject(new FfmpegCanceledException());
          } else {
            reject(err);
          }
        })
        .on('end', async () => {
          await this.cleanupTempFiles({
            paths: [inputPath],
          });

          resolve();
        });

      this.ffmpegProgressService.registerCommand(jobId, command);

      command.save(outputPath);
    });
  }

  private async cleanupTempFiles(inputObject: CleanupTempFilesInputObject): Promise<void> {
    const { paths } = inputObject;

    for (const filePath of paths) {
      await fs.unlink(filePath);
    }
  }
}

export { FfmpegService };
