import { Module } from '@nestjs/common';

import { FfmpegProgressGatewayModule } from './progress/progress.module';

@Module({
  imports: [FfmpegProgressGatewayModule],
  exports: [FfmpegProgressGatewayModule],
})
export class FfmpegGatewaysModule {}
