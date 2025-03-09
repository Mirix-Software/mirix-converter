import { promises as fs } from 'node:fs';
import { join } from 'node:path';

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
class TemporalFileService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TemporalFileService.name);

  private readonly updateIntervalMs = 60 * 60 * 1000; // 1 hour

  private readonly rootDirectoryPath = '.temp';
  private readonly baseDirectoryName = 'temporal-files';
  private readonly directoriesPrefix = 'files-';
  private readonly jobDirectoriesPrefix = 'job-';

  private currentDirectoryPath: string | null = null;

  public onApplicationBootstrap(): void {
    setInterval(async () => {
      await this.updateTemporalDirectories();
    }, this.updateIntervalMs);
  }

  public async getFilePath(filename: string, jobId?: string): Promise<string> {
    const currentDirectoryPath = jobId ? await this.getJobDirectoryPath(jobId) : await this.getCurrentDirectoryPath();

    return join(currentDirectoryPath, filename);
  }

  public async getJobWorkingDirectory(jobId: string): Promise<string> {
    return this.getJobDirectoryPath(jobId);
  }

  private async getJobDirectoryPath(jobId: string): Promise<string> {
    await this.createDirectoryIfNotExists(this.rootDirectoryPath);

    const baseDirectoryPath = join(this.rootDirectoryPath, this.baseDirectoryName);

    await this.createDirectoryIfNotExists(baseDirectoryPath);

    const jobDirectoryPath = join(baseDirectoryPath, `${this.jobDirectoriesPrefix}${jobId}`);

    await this.createDirectoryIfNotExists(jobDirectoryPath);

    return jobDirectoryPath;
  }

  private async getCurrentDirectoryPath(): Promise<string> {
    if (this.currentDirectoryPath !== null) {
      return this.currentDirectoryPath;
    }

    return this.createNewTemporalDirectory();
  }

  private async updateTemporalDirectories(): Promise<void> {
    try {
      await this.createNewTemporalDirectory();
      await this.deleteOldTemporalDirectories();
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async createNewTemporalDirectory(): Promise<string> {
    await this.createDirectoryIfNotExists(this.rootDirectoryPath);

    const baseDirectoryPath = join(this.rootDirectoryPath, this.baseDirectoryName);

    await this.createDirectoryIfNotExists(baseDirectoryPath);

    const temporalDirectoryPathTemplate = join(baseDirectoryPath, this.directoriesPrefix);

    this.currentDirectoryPath = await fs.mkdtemp(temporalDirectoryPathTemplate);

    return this.currentDirectoryPath;
  }

  private async deleteOldTemporalDirectories(): Promise<void> {
    const baseDirectoryPath = join(this.rootDirectoryPath, this.baseDirectoryName);

    const baseDirectoryExists = await this.directoryExists(baseDirectoryPath);

    if (!baseDirectoryExists) {
      return;
    }

    const expiredAt = new Date(Date.now() - 2 * this.updateIntervalMs);

    const fileOrDirectoryNames = await fs.readdir(baseDirectoryPath);

    const deletionPromises = fileOrDirectoryNames.map(async (name) => {
      const path = join(baseDirectoryPath, name);

      await this.deleteFileOrDirectoryIfOld(path, expiredAt);
    });

    await Promise.all(deletionPromises);
  }

  private async createDirectoryIfNotExists(path: string): Promise<void> {
    const directoryExists = await this.directoryExists(path);

    if (directoryExists) {
      return;
    }

    try {
      await fs.mkdir(path);
    } catch (error) {
      if (this.isAlreadyExistsError(error)) {
        return;
      }

      throw error;
    }
  }

  private async deleteFileOrDirectoryIfOld(path: string, expiredAt: Date): Promise<void> {
    const stat = await fs.stat(path);

    if (stat.birthtime < expiredAt) {
      await fs.rm(path, { recursive: true });
    }
  }

  private async directoryExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);

      return true;
    } catch (error) {
      if (!this.isNotExistsError(error)) {
        throw error;
      }

      return false;
    }
  }

  private isAlreadyExistsError(error: unknown): boolean {
    return error instanceof Error && 'code' in error && error.code === 'EEXIST';
  }

  private isNotExistsError(error: unknown): boolean {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT';
  }
}

export { TemporalFileService };
