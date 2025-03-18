import { Module } from '@nestjs/common';

import { FileModule } from '@core-module/file-service';
import { TemporalFileModule } from '@core-module/temporal-file';
import { FfmpegHlsModule } from '@domain/ffmpeg/services/ffmpeg-hls';
import { FfmpegProgressModule } from '@domain/ffmpeg/services/ffmpeg-progress';
import { FfmpegResolutionModule } from '@domain/ffmpeg/services/ffmpeg-resolution';

import { FfmpegService } from './ffmpeg.service';

@Module({
  imports: [TemporalFileModule, FfmpegProgressModule, FfmpegHlsModule, FileModule, FfmpegResolutionModule],

  providers: [FfmpegService],

  exports: [FfmpegService],
})
export class FfmpegModule {}
