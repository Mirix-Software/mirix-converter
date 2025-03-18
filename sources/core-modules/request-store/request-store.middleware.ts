import { randomUUID } from 'crypto';

import { Injectable, NestMiddleware } from '@nestjs/common';

import { AnyArray } from '@common/types';
import { Request, Response } from 'express';

import { RequestStore, RequestStoreService } from './request-store.service';

const X_REQUEST_ID = 'X-Request-ID';

@Injectable()
class RequestStoreMiddleware implements NestMiddleware {
  public constructor(private readonly requestStoreService: RequestStoreService) {}

  public use<Next extends (...args: AnyArray) => void>(request: Request, response: Response, next: Next): void {
    const requestId = request.header(X_REQUEST_ID) ?? randomUUID();

    response.header(X_REQUEST_ID, requestId);

    const store: RequestStore = {
      requestId,
    };

    this.requestStoreService.run(store, next);
  }
}

export { RequestStoreMiddleware };
