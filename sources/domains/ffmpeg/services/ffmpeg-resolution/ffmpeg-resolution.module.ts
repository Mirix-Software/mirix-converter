import { Module } from '@nestjs/common';

import { TemporalFileModule } from '@core-module/temporal-file';

import { FfmpegResolutionService } from './ffmpeg-resolution.service';

@Module({
  imports: [TemporalFileModule],

  providers: [FfmpegResolutionService],

  exports: [FfmpegResolutionService],
})
export class FfmpegResolutionModule {}
