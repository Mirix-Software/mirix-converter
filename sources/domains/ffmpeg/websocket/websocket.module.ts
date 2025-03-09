import { Module } from '@nestjs/common';

import { FfmpegGatewaysModule } from './gateways';

@Module({
  imports: [FfmpegGatewaysModule],
  exports: [FfmpegGatewaysModule],
})
export class FfmpegWebsocketModule {}
