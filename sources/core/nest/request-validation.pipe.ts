import { ValidationError, ValidationPipe } from '@nestjs/common';

import { InternalException, ValidationException } from '@core/exceptions';
import { mapValidationException } from '@core/functions';

type ExceptionFactory = (validationErrors?: ValidationError[]) => ValidationException | InternalException;

class RequestValidationPipe extends ValidationPipe {
  public constructor() {
    super({
      transform: true,
      transformOptions: {
        exposeDefaultValues: true,
        exposeUnsetFields: false,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }

  public createExceptionFactory(): ExceptionFactory {
    return (errors) => mapValidationException(errors);
  }
}

export { RequestValidationPipe };
