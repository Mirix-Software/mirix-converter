import { Exception } from '@core/decorators';

import { BaseException } from './base-exception.class';

@Exception()
class InternalException extends BaseException {
  public constructor() {
    const message = InternalException.getMessage();

    super(message);
  }

  public static getMessage(): string {
    return 'Internal exception';
  }

  public static getCode(): string {
    return InternalException.name;
  }
}

export { InternalException };
