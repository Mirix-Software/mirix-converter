import { AsyncLocalStorage } from 'async_hooks';

import { Injectable } from '@nestjs/common';

import { AnyArray } from '@common/types';

type RequestStore = {
  readonly requestId: string;
};

@Injectable()
class RequestStoreService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<RequestStore>();

  public run<T, Method extends (...args: AnyArray) => T>(store: RequestStore, method: Method): T {
    return this.asyncLocalStorage.run(store, method);
  }

  public get store(): RequestStore | null {
    const requestStore = this.asyncLocalStorage.getStore();

    return requestStore ?? null;
  }
}

export { RequestStore, RequestStoreService };
