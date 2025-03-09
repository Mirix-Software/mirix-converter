import { Module } from '@nestjs/common';

import { PatchedNestjsFormDataModule } from '@core-module/patched-nestjs-form-data';
import { FfmpegModule } from '@domain/ffmpeg/services/ffmpeg';
import { FfmpegProgressModule } from '@domain/ffmpeg/services/ffmpeg-progress';

import { FfmpegController } from './ffmpeg.controller';
import { FfmpegRestService } from './ffmpeg.rest-service';

@Module({
  imports: [PatchedNestjsFormDataModule, FfmpegModule, FfmpegProgressModule],

  controllers: [FfmpegController],

  providers: [FfmpegRestService],
})
export class FfmpegRestModule {}
