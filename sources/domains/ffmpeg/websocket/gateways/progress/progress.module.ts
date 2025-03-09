import { Module } from '@nestjs/common';

import { FfmpegProgressGateway } from './progress.gateway';

@Module({
  providers: [FfmpegProgressGateway],
  exports: [FfmpegProgressGateway],
})
export class FfmpegProgressGatewayModule {}
