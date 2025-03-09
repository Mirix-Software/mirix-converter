import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

import { ProgressData, ProgressEventType, ProgressStatus, ProgressUpdateMessage, SubscriptionResponse } from '@domain/ffmpeg/types';
import { Server, Socket } from 'socket.io';

export const FFMPEG_EVENTS = {
  CANCEL_JOB: 'ffmpeg.job.cancel',
  JOB_CANCELED: 'ffmpeg.job.canceled',
  JOB_CANCEL_FAILED: 'ffmpeg.job.cancel.failed',
  PROGRESS_UPDATE: 'ffmpeg.progress.update',
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'ffmpeg',
})
@Injectable()
export class FfmpegProgressGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  private readonly server: Server;

  private readonly clients: Map<string, Socket> = new Map();

  public constructor(private readonly eventEmitter: EventEmitter2) {}

  public onModuleInit(): void {
    this.eventEmitter.on(FFMPEG_EVENTS.JOB_CANCELED, (payload: { jobId: string }) => {
      const cancelProgressUpdate: ProgressData = {
        status: ProgressStatus.CANCELED,
        progress: 0,
      };

      this.sendProgressUpdate(payload.jobId, cancelProgressUpdate);
    });

    this.eventEmitter.on('ffmpeg.progress.update', (payload: { jobId: string; progress: ProgressData }) => {
      this.sendProgressUpdate(payload.jobId, payload.progress);
    });
  }

  public handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, client);
  }

  public handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  @SubscribeMessage(ProgressEventType.SUBSCRIBE)
  public handleSubscribeToProgress(client: Socket, jobId: string): SubscriptionResponse {
    console.log(`Client ${client.id} subscribed to progress for job ${jobId}`);
    client.join(`progress_${jobId}`);

    return { event: 'subscribed', data: { jobId } };
  }

  @SubscribeMessage(ProgressEventType.UNSUBSCRIBE)
  public handleUnsubscribeFromProgress(client: Socket, jobId: string): SubscriptionResponse {
    console.log(`Client ${client.id} unsubscribed from progress for job ${jobId}`);
    client.leave(`progress_${jobId}`);

    return { event: 'unsubscribed', data: { jobId } };
  }

  @SubscribeMessage(ProgressEventType.CANCEL)
  public async handleCancelJob(client: Socket, jobId: string): Promise<SubscriptionResponse> {
    console.log(`Client ${client.id} requested to cancel job ${jobId}`);

    const result = await this.eventEmitter.emitAsync(FFMPEG_EVENTS.CANCEL_JOB, { jobId });
    const success = result && result.length > 0 && result[0] === true;

    if (success) {
      return { event: 'canceled', data: { jobId } };
    }

    return { event: 'cancel_failed', data: { jobId } };
  }

  public sendProgressUpdate(jobId: string, progress: ProgressData): void {
    const message: ProgressUpdateMessage = {
      jobId,
      progress,
    };

    this.server.to(`progress_${jobId}`).emit(ProgressEventType.UPDATE, message);
  }
}
