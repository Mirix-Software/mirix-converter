import { ValidationConstraint } from './validation.exception';

class RequestException extends Error {
  public constructor(
    message: string,
    public readonly code: string,
    public readonly isInternalException: boolean,
    public readonly requestId?: string,
    public readonly validationConstraints?: ValidationConstraint[],
  ) {
    super(message);
  }
}

export { RequestException };
