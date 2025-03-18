import { promises as fs } from 'node:fs';
import path from 'node:path';

import { Injectable } from '@nestjs/common';

import { DelayCleanupInputObject } from '@domain/ffmpeg/types';

@Injectable()
class FileService {
  public async checkFileExists(filePath: string): Promise<boolean> {
    await fs.access(filePath);

    return true;
  }

  public getFilenameWithoutExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return filename;
    }

    return filename.slice(0, lastDotIndex);
  }

  public async delayAndCleanup(inputObject: DelayCleanupInputObject): Promise<void> {
    const { resolution, directoryPath, delayMs } = inputObject;

    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        const files = await fs.readdir(directoryPath);
        const tsFilesToDelete = files.filter((file) => file.includes(`${resolution}`));

        for (const file of tsFilesToDelete) {
          const filePath = path.join(directoryPath, file);

          await fs.unlink(filePath);
        }

        resolve();
      }, delayMs);
    });
  }
}

export { FileService };
