import { FfmpegCommand as FfmpegCommandType } from 'fluent-ffmpeg';

export interface ProgressData {
  status?: string;
  progress: number;
  frame?: number;
  fps?: number;
  speed?: string;
  bitrate?: number;
  time?: string;
  error?: string;
}

export interface FfmpegProgress {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent?: number | undefined;
}

export interface SubscriptionResponse {
  event: string;

  data: JobData;
}

export interface JobData {
  jobId: string;
}

export interface ProgressUpdateMessage {
  jobId: string;
  progress: ProgressData;
}

export enum ProgressStatus {
  INITIALIZED = 'initialized',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELED = 'canceled',
  PAUSED = 'paused',
}

export enum ProgressEventType {
  SUBSCRIBE = 'subscribeToProgress',
  UNSUBSCRIBE = 'unsubscribeFromProgress',
  UPDATE = 'progressUpdate',
  CANCEL = 'cancelProgress',
}

export interface FfmpegCommand {
  command: FfmpegCommandType;
  jobId: string;
}
