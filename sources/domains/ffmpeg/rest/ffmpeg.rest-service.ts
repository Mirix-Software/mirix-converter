import { ConflictException, Injectable, StreamableFile } from '@nestjs/common';

import { FfmpegService } from '@domain/ffmpeg/services/ffmpeg';
import { FfmpegProgressService } from '@domain/ffmpeg/services/ffmpeg-progress';
import { FfmpegCanceledException } from '@domain/ffmpeg/types';
import { Response } from 'express';
import { MemoryStoredFile } from 'nestjs-form-data';

import { ConvertVideoDto } from './dto';

@Injectable()
class FfmpegRestService {
  public constructor(
    private readonly ffmpegService: FfmpegService,
    private readonly ffmpegProgressService: FfmpegProgressService,
  ) {}

  public async convertToHls(body: ConvertVideoDto, response: Response, jobId: string): Promise<StreamableFile> {
    this.ffmpegProgressService.registerJob(jobId);

    this.setFileHeaders(body.file, response);

    const originalMetadata = {
      width: body.width,
      height: body.height,
      name: body.name,
      size: body.size,
    };

    try {
      const result = await this.ffmpegService.convertToHls({
        file: body.file,
        jobId,
        originalMetadata,
      });

      this.ffmpegProgressService.completeJob(jobId);

      return new StreamableFile(result.buffer);
    } catch (error) {
      if (error instanceof FfmpegCanceledException) {
        throw new ConflictException('Конвертация была отменена пользователем');
      }

      throw error;
    }
  }

  private setFileHeaders(file: MemoryStoredFile, response: Response): void {
    response.contentType(file.mimeType).attachment(file.originalName);
  }
}

export { FfmpegRestService };
