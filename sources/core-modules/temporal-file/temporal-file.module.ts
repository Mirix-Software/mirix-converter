import { Module } from '@nestjs/common';

import { TemporalFileService } from './temporal-file.service';

@Module({
  providers: [TemporalFileService],

  exports: [TemporalFileService],
})
export class TemporalFileModule {}
