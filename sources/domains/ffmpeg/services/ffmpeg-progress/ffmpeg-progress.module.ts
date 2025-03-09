import { Module } from '@nestjs/common';

import { FfmpegProgressService } from './ffmpeg-progress.service';

@Module({
  providers: [FfmpegProgressService],
  exports: [FfmpegProgressService],
})
export class FfmpegProgressModule {}
