import { Readable } from 'node:stream';

import { FormDataInterceptorConfig, MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { ParticleStoredFile } from 'nestjs-form-data/dist/interfaces/ParticleStoredFile';

class PatchedMemoryStoredFile extends MemoryStoredFile {
  public static async create(busboyFileMeta: ParticleStoredFile, stream: Readable, config: FormDataInterceptorConfig): Promise<MemoryStoredFile> {
    const memoryStoredFile = await MemoryStoredFile.create(busboyFileMeta, stream, config);

    memoryStoredFile.originalName = Buffer.from(memoryStoredFile.originalName, 'latin1').toString('utf-8');
    memoryStoredFile.encoding = 'utf-8';

    return memoryStoredFile;
  }
}

const PatchedNestjsFormDataModule = NestjsFormDataModule.config({
  storage: PatchedMemoryStoredFile,
});

export { PatchedNestjsFormDataModule };
