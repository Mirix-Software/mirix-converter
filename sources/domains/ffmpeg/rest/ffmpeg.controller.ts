import { Body, Controller, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiConsumes, ApiProduces, ApiTags } from '@nestjs/swagger';

import { MimeType } from '@common/types';
import { Response } from 'express';
import { FormDataRequest } from 'nestjs-form-data';

import { ConvertVideoDto } from './dto';
import { FfmpegRestService } from './ffmpeg.rest-service';

@ApiTags('Ffmpeg')
@Controller()
class FfmpegController {
  public constructor(private readonly ffmpegRestService: FfmpegRestService) {}

  @Post('/ffmpeg/hls')
  @FormDataRequest()
  @ApiConsumes(MimeType.MULTIPART_FORM_DATA)
  @ApiProduces(MimeType.APPLICATION_M3U8)
  public async convertToHls(
    @Body()
    body: ConvertVideoDto,

    @Res({ passthrough: true })
    response: Response,
  ): Promise<StreamableFile> {
    return this.ffmpegRestService.convertToHls(body, response, body.jobId);
  }
}

export { FfmpegController };
