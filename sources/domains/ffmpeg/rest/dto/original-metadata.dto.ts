import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class OriginalMetadataDto {
  @ApiProperty({
    description: 'Width',
    type: 'string',
  })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  readonly width: number;

  @ApiProperty({
    description: 'Height',
    type: 'string',
  })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  readonly height: number;

  @ApiProperty({
    description: 'Name',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Size',
    type: 'string',
  })
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  readonly size: number;
}

export { OriginalMetadataDto };
