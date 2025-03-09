import { HttpException } from '@nestjs/common';

import { BaseException, InternalException, RequestException, ValidationException } from '@core/exceptions';

function mapRequestException(exception: BaseException | HttpException, requestId?: string): RequestException {
  let code: string;
  let message: string;

  if (exception instanceof HttpException) {
    code = String(exception.getStatus());
    message = exception.message;
  } else {
    code = exception.getCode() ?? InternalException.getCode();
    message = exception.getMessage();
  }

  const isInternalException = code === InternalException.getCode();
  const validationConstraints = exception instanceof ValidationException ? exception.constraints : undefined;

  return new RequestException(message, code, isInternalException, requestId, validationConstraints);
}

export { mapRequestException };
