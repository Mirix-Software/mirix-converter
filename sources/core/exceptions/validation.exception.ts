import { Exception } from '@core/decorators';

import { BaseException } from './base-exception.class';

type ValidationConstraint = {
  property: string;
  constraint: string;
  message: string;
};

@Exception()
class ValidationException extends BaseException {
  readonly constraints: ValidationConstraint[];

  public constructor(constraint: ValidationConstraint);
  public constructor(constraints: ValidationConstraint[]);

  public constructor(constraintOrConstraints: ValidationConstraint | ValidationConstraint[]) {
    super('Validation exception');

    this.constraints = Array.isArray(constraintOrConstraints) ? constraintOrConstraints : [constraintOrConstraints];
  }
}

export { ValidationConstraint, ValidationException };
