import { EventEmitter } from 'events';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { FfmpegCommand, ProgressData, ProgressStatus } from '@domain/ffmpeg/types';
import { FFMPEG_EVENTS } from '@domain/ffmpeg/websocket/gateways/progress/progress.gateway';

@Injectable()
export class FfmpegProgressService implements OnModuleInit {
  private progress: ProgressData = {
    progress: 0,
  };

  private readonly progressEmitters: Map<string, EventEmitter> = new Map();
  private readonly lastProgressUpdates: Map<string, ProgressData> = new Map();
  private readonly activeCommands: Map<string, FfmpegCommand> = new Map();

  public constructor(private readonly eventEmitter: EventEmitter2) {}

  public onModuleInit(): void {
    this.eventEmitter.on(FFMPEG_EVENTS.CANCEL_JOB, async (payload: { jobId: string }) => {
      const success = await this.cancelJob(payload.jobId);

      if (success) {
        this.eventEmitter.emit(FFMPEG_EVENTS.JOB_CANCELED, { jobId: payload.jobId });
      } else {
        this.eventEmitter.emit(FFMPEG_EVENTS.JOB_CANCEL_FAILED, { jobId: payload.jobId });
      }

      return success;
    });
  }

  public registerJob(jobId: string): EventEmitter {
    const emitter = new EventEmitter();

    this.progressEmitters.set(jobId, emitter);

    this.lastProgressUpdates.set(jobId, {
      status: ProgressStatus.INITIALIZED,
      progress: 0,
    });

    emitter.on('progress', (progress: ProgressData) => {
      const currentProgress = this.lastProgressUpdates.get(jobId) || { progress: 0 };

      this.lastProgressUpdates.set(jobId, { ...currentProgress, ...progress });

      this.sendProgressUpdate(jobId, progress);
    });

    emitter.on('end', () => {
      const finalProgress: ProgressData = {
        status: ProgressStatus.COMPLETED,
        progress: 100,
      };

      this.lastProgressUpdates.set(jobId, finalProgress);
      this.sendProgressUpdate(jobId, finalProgress);
      this.unregisterJob(jobId);
    });

    emitter.on('error', (error: Error) => {
      console.error(`Error in job ${jobId}: ${error.message}`);

      const errorData: ProgressData = {
        status: ProgressStatus.ERROR,
        progress: 0,
        error: error.message,
      };

      this.lastProgressUpdates.set(jobId, errorData);
      this.sendProgressUpdate(jobId, errorData);
      this.unregisterJob(jobId);
    });

    return emitter;
  }

  public registerCommand(jobId: string, command: import('fluent-ffmpeg').FfmpegCommand): void {
    this.activeCommands.set(jobId, { command, jobId });
  }

  private async cancelJob(jobId: string): Promise<boolean> {
    console.log(`Attempting to cancel job: ${jobId}`);

    const command = this.activeCommands.get(jobId);

    if (!command) {
      console.warn(`Cannot cancel non-existent job: ${jobId}`);

      return false;
    }

    try {
      if (command.command && typeof command.command.kill === 'function') {
        await new Promise<void>((resolve) => {
          command.command.kill('SIGTERM');
          resolve();
        });
        console.log(`Successfully killed ffmpeg process for job: ${jobId}`);
      }

      const cancelData: ProgressData = {
        status: ProgressStatus.CANCELED,
        progress: 0,
      };

      this.lastProgressUpdates.set(jobId, cancelData);
      this.sendProgressUpdate(jobId, cancelData);

      this.activeCommands.delete(jobId);

      return true;
    } catch (error) {
      console.error(`Error while canceling job ${jobId}:`, error);

      return false;
    }
  }

  public unregisterJob(jobId: string): void {
    const emitter = this.progressEmitters.get(jobId);

    if (emitter) {
      emitter.removeAllListeners();
      this.progressEmitters.delete(jobId);
      this.lastProgressUpdates.delete(jobId);
      this.activeCommands.delete(jobId);
      console.log(`Unregistered job: ${jobId}`);
    }
  }

  private sendProgressUpdate(jobId: string, progress: ProgressData): void {
    this.eventEmitter.emit(FFMPEG_EVENTS.PROGRESS_UPDATE, { jobId, progress });
  }

  public updateProgress(jobId: string, progress: ProgressData): void {
    this.progress = progress;

    if (!this.progressEmitters.has(jobId)) {
      console.warn(`Cannot update progress for non-existent job: ${jobId}`);

      return;
    }

    const emitter = this.progressEmitters.get(jobId);

    const currentProgress = this.lastProgressUpdates.get(jobId) || { progress: 0 };
    const updatedProgress = { ...currentProgress, ...this.progress };

    this.lastProgressUpdates.set(jobId, updatedProgress);

    if (this.progress.progress === 100 && !this.progress.status) {
      updatedProgress.status = ProgressStatus.COMPLETED;
    }

    if (emitter) {
      emitter.emit('progress', updatedProgress);
    } else {
      this.sendProgressUpdate(jobId, updatedProgress);
    }
  }

  public completeJob(jobId: string): void {
    const emitter = this.progressEmitters.get(jobId);

    if (emitter) {
      const lastProgress = this.lastProgressUpdates.get(jobId) || { progress: 0 };

      this.updateProgress(jobId, {
        ...lastProgress,
        status: ProgressStatus.COMPLETED,
        progress: 100,
      });

      emitter.emit('end');
    } else {
      console.warn(`Cannot complete non-existent job: ${jobId}`);

      this.sendProgressUpdate(jobId, {
        status: ProgressStatus.COMPLETED,
        progress: 100,
      });
    }
  }

  public failJob(jobId: string, error: Error): void {
    const emitter = this.progressEmitters.get(jobId);

    if (emitter) {
      emitter.emit('error', error);
    } else {
      console.warn(`Cannot fail non-existent job: ${jobId}`);

      this.sendProgressUpdate(jobId, {
        status: ProgressStatus.ERROR,
        progress: 0,
        error: error.message,
      });
    }
  }

  public getJobProgress(jobId: string): ProgressData | null {
    return this.lastProgressUpdates.get(jobId) || null;
  }
}
