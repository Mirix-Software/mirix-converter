import { ConflictException, Injectable } from '@nestjs/common';

import { HEIGHT_MAP } from './constants';

@Injectable()
class FfmpegResolutionService {
  public constructor() {}

  public getBandwidthForResolution(resolution: string): number {
    return HEIGHT_MAP[resolution] || 1000000;
  }

  public getResolutionString(resolution: string): string {
    const height = parseInt(resolution.replace('p', ''), 10);
    const width = this.calculateWidthFromHeight(height);

    return `${width}x${height}`;
  }

  public getSourceHeight(height: number | undefined): number {
    if (!height) {
      throw new ConflictException('Высота исходного видео не найдена');
    }

    return height;
  }

  private calculateWidthFromHeight(height: number): number {
    return Math.floor((height * 16) / 9);
  }
}

export { FfmpegResolutionService };
