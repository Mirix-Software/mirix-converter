import * as fs from 'fs/promises';
import * as path from 'path';

import { Injectable } from '@nestjs/common';

import { MimeType } from '@common/types';
import { FileService } from '@core-module/file-service';
import { FfmpegProgressService } from '@domain/ffmpeg/services/ffmpeg-progress';
import { FfmpegResolutionService } from '@domain/ffmpeg/services/ffmpeg-resolution';
import { HLS_OPTIONS } from '@domain/ffmpeg/services/ffmpeg/constants';
import {
  CreateHlsVariantInputObject,
  CreateHlsVariantsInputObject,
  CreateMasterPlaylistInputObject,
  EnhancedMemoryStoredFile,
  FfmpegCanceledException,
  FileMetadata,
  PrepareResultInputObject,
} from '@domain/ffmpeg/types';
import Ffmpeg from 'fluent-ffmpeg';
import { MemoryStoredFile } from 'nestjs-form-data';

@Injectable()
class FfmpegHlsService {
  public constructor(
    private readonly ffmpegResolutionService: FfmpegResolutionService,
    private readonly fileService: FileService,
    private readonly ffmpegProgressService: FfmpegProgressService,
  ) {}

  public async createMasterPlaylist(inputObject: CreateMasterPlaylistInputObject): Promise<void> {
    const { outputPath, variantPaths } = inputObject;

    let content = '#EXTM3U\n';

    content += '#EXT-X-VERSION:3\n';

    for (const variant of variantPaths) {
      const relativePath = path.relative(path.dirname(outputPath), variant.path);
      const bandwidth = this.ffmpegResolutionService.getBandwidthForResolution(variant.resolution);

      content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${this.ffmpegResolutionService.getResolutionString(variant.resolution)}\n`;
      content += `${relativePath}\n`;
    }

    await fs.writeFile(outputPath, content);
  }

  public async prepareResult(inputObject: PrepareResultInputObject): Promise<MemoryStoredFile> {
    const { outputPath, outputFilename } = inputObject;

    const resultBuffer = await fs.readFile(outputPath);

    const resultMetadata: Omit<FileMetadata, 'width' | 'height'> = {
      originalName: outputFilename,
      encoding: 'utf-8',
      mimetype: MimeType.APPLICATION_M3U8,
    };

    const result = new MemoryStoredFile() as EnhancedMemoryStoredFile;

    result.buffer = resultBuffer;
    result.originalName = resultMetadata.originalName ?? '';
    result.encoding = resultMetadata.encoding ?? '';
    Object.defineProperty(result, 'mimetype', {
      value: resultMetadata.mimetype,
    });

    return result;
  }

  public async createHlsVariants(inputObject: CreateHlsVariantsInputObject): Promise<void> {
    const { resolutionsToConvert, compressedPath, versionsDir, jobId, progressStep, variantPaths, cleanupPromises = [] } = inputObject;

    for (let i = 0; i < resolutionsToConvert.length; i += 1) {
      const resolution = resolutionsToConvert[i];
      const versionPath = path.join(versionsDir, `${resolution.name}.m3u8`);
      const baseProgress = progressStep * (i + 1);

      await this.createHlsVariant({
        inputPath: compressedPath,
        outputPath: versionPath,
        height: resolution.height,
        jobId,
        baseProgress,
        progressStep,
      });

      variantPaths.push({ path: versionPath, resolution: resolution.name });

      const cleanupPromise = this.fileService.delayAndCleanup({
        resolution: resolution.name,
        directoryPath: versionsDir,
        delayMs: 30000,
      });

      cleanupPromises.push(cleanupPromise);
    }
  }

  public async createHlsVariant(inputObject: CreateHlsVariantInputObject): Promise<void> {
    const { inputPath, outputPath, height, jobId, baseProgress, progressStep } = inputObject;

    const outputDir = path.dirname(outputPath);
    const segmentFileName = path.join(outputDir, `segment_${height}p_%03d.ts`);

    await this.fileService.checkFileExists(inputPath);

    return new Promise((resolve, reject) => {
      const command = Ffmpeg(inputPath)
        .outputOptions([...HLS_OPTIONS, `-vf scale=-2:${height}`, '-hls_segment_filename', segmentFileName])
        .on('progress', (progress) => {
          const percent = progress.percent || 0;
          const stepProgress = (percent / 100) * progressStep;

          this.ffmpegProgressService.updateProgress(jobId, {
            ...progress,
            progress: baseProgress + stepProgress,
          });
        })
        .on('start', (command) => {
          console.log('command', command);
        })
        .on('error', async (err) => {
          console.error(`Ошибка при создании ${height}p:`, err);
          await this.fileService.cleanupTempFiles({
            paths: [inputPath],
          });
          await fs.rmdir(outputDir, { recursive: true });
          if (err.message && err.message.includes('Exiting normally, received signal 15')) {
            reject(new FfmpegCanceledException());
          } else {
            reject(err);
          }
        })
        .on('end', () => {
          resolve();
        });

      this.ffmpegProgressService.registerCommand(jobId, command);

      command.save(outputPath);
    });
  }
}

export { FfmpegHlsService };
