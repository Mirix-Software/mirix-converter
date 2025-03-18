import { Module } from '@nestjs/common';

import { FileModule } from '@core-module/file-service';
import { TemporalFileModule } from '@core-module/temporal-file';
import { FfmpegProgressModule } from '@domain/ffmpeg/services/ffmpeg-progress';
import { FfmpegResolutionModule } from '@domain/ffmpeg/services/ffmpeg-resolution';

import { FfmpegHlsService } from './ffmpeg-hls.service';

@Module({
  imports: [TemporalFileModule, FfmpegResolutionModule, FileModule, FfmpegProgressModule],

  providers: [FfmpegHlsService],

  exports: [FfmpegHlsService],
})
export class FfmpegHlsModule {}
