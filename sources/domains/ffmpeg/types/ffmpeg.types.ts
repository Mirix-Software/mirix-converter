import { BaseException } from '@core/exceptions';
import { MemoryStoredFile } from 'nestjs-form-data';

export interface FileMetadata {
  originalName?: string;
  encoding?: string;
  mimetype?: string;
  width: number;
  height: number;
  resolution?: string;
}

export interface EnhancedMemoryStoredFile extends MemoryStoredFile {
  width?: number;
  height?: number;
  resolution?: string;
}

export interface HlsConversionInputObject {
  file: MemoryStoredFile;
  jobId: string;
  originalMetadata?: FileMetadata;
}

export interface CreateHlsVariantInputObject {
  inputPath: string;
  outputPath: string;
  height: number;
  jobId: string;
  baseProgress: number;
  progressStep: number;
}

export interface CompressVideoParams {
  inputPath: string;
  outputPath: string;
  jobId: string;
  progressStep: number;
  uploadToS3?: boolean;
}

export interface PrepareResultInputObject {
  outputPath: string;
  outputFilename: string;
  variantPaths: VariantPath[];
}

export interface VariantPath {
  path: string;
  resolution: string;
}

export interface UploadAssetsToS3Params {
  masterPath: string;
  variantPaths: VariantPath[];
  filePrefix: string;
}

export interface CreateMasterPlaylistInputObject {
  outputPath: string;
  variantPaths: VariantPath[];
}

export interface GetVideoInfoParams {
  filePath: string;
}

export interface CleanupTempFilesInputObject {
  paths: string[];
}

export interface DelayCleanupInputObject {
  resolution: string;
  directoryPath: string;
  delayMs: number;
}

export interface VariantPaths {
  path: string;
  resolution: string;
}

export interface CreateHlsVariantsInputObject {
  resolutionsToConvert: Resolution[];
  compressedPath: string;
  versionsDir: string;
  jobId: string;
  progressStep: number;
  variantPaths: VariantPaths[];
  cleanupPromises?: Promise<void>[];
}

export interface Resolution {
  name: string;
  height: number;
}

export class FfmpegCanceledException extends BaseException {
  public constructor(message: string = 'Процесс конвертации был отменен') {
    super(message);
    this.name = 'FfmpegCanceledException';
  }
}
