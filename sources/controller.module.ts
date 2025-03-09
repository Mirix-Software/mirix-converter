import { Module } from '@nestjs/common';

import { FfmpegRestModule } from '@domain/ffmpeg/rest';

@Module({
  imports: [FfmpegRestModule],

  exports: [],
})
export class ControllerModule {}
