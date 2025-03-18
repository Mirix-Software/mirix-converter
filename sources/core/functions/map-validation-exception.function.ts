import { ValidationError } from '@nestjs/common';

import { InternalException, ValidationException } from '@core/exceptions';

function flatErrors(errors: ValidationError[]): ValidationError[] {
  return errors.flatMap((error) => {
    const flatChildren = flatErrors(error.children ?? []);

    return [error, ...flatChildren];
  });
}

function mapValidationException(errors: ValidationError[]): ValidationException;
function mapValidationException(errors?: ValidationError[] | null): ValidationException | InternalException;

function mapValidationException(errors: ValidationError[] | null = null): ValidationException | InternalException {
  if (errors === null) {
    return new InternalException();
  }

  const flattenErrors = flatErrors(errors);

  const constraints = flattenErrors.flatMap((error) => {
    const entries = Object.entries(error.constraints ?? {});

    return entries.map(([constraint, message]) => ({
      property: error.property,
      constraint,
      message,
    }));
  });

  return new ValidationException(constraints);
}

export { mapValidationException };
