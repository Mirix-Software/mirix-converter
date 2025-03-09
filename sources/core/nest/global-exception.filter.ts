import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { RequestStoreService } from '@core-module/request-store';
import { BaseException, InternalException, RequestException } from '@core/exceptions';
import { mapRequestException } from '@core/functions';
import { Response } from 'express';
import { pick } from 'ramda';

@Catch()
class GlobalExceptionFilter implements ExceptionFilter {
  public constructor(private readonly requestStoreService: RequestStoreService) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    console.log('requestException', exception);

    const requestException = this.mapRequestException(exception);

    this.sendExceptionResponse(requestException, host);
  }

  private mapRequestException(exception: unknown): RequestException {
    const baseException = exception instanceof BaseException || exception instanceof HttpException ? exception : new InternalException();

    console.log('exception', exception instanceof BaseException);

    const requestId = this.requestStoreService.store?.requestId;

    return mapRequestException(baseException, requestId);
  }

  private sendExceptionResponse(exception: RequestException, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();

    const httpStatus = exception.isInternalException ? HttpStatus.INTERNAL_SERVER_ERROR : Number(exception.code);
    const body = pick(['message', 'code', 'requestId', 'validationConstraints'], exception);

    response.status(httpStatus).send(body);
  }
}

export { GlobalExceptionFilter };
