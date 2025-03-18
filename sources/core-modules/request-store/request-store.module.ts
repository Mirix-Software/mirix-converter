import { Module } from '@nestjs/common';

import { RequestStoreService } from './request-store.service';

@Module({
  providers: [RequestStoreService],

  exports: [RequestStoreService],
})
export class RequestStoreModule {}
