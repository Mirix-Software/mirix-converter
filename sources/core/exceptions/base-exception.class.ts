import { EXCEPTION_CODE } from '@core/decorators';

class BaseException extends Error {
  public constructor(message: string) {
    super(message);
  }

  public getMessage(): string {
    return this.message;
  }

  public getCode(): string | null {
    return Reflect.getOwnMetadata(EXCEPTION_CODE, this.constructor) ?? null;
  }
}

export { BaseException };
