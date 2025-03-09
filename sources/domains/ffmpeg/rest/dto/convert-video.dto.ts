import { ApiProperty } from '@nestjs/swagger';

import { FFMPEG_VIDEO_CODECS } from '@domain/ffmpeg/rest/constants';
import { IsNotEmpty, IsString } from 'class-validator';
import { HasMimeType, IsFile, MemoryStoredFile } from 'nestjs-form-data';

import { OriginalMetadataDto } from './original-metadata.dto';

class ConvertVideoDto extends OriginalMetadataDto {
  @ApiProperty({
    description: 'File',
    type: 'string',
    format: 'binary',
  })
  @IsFile()
  @HasMimeType(FFMPEG_VIDEO_CODECS)
  readonly file: MemoryStoredFile;

  @ApiProperty({
    description: 'Job ID',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  readonly jobId: string;
}

export { ConvertVideoDto };
