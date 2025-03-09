/* eslint-disable @typescript-eslint/ban-ts-comment */
import { HttpStatus, Injectable, Optional, PipeTransform } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

import { isNumberString } from 'class-validator';
import { isNil } from 'ramda';

export interface ParseNumberStringPipeOptions {
  errorHttpStatusCode?: HttpStatus;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  exceptionFactory?: (error: string) => any;
  optional?: boolean;
}

@Injectable()
export class ParseNumberStringPipe implements PipeTransform<string> {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected exceptionFactory: (error: string) => any;

  public constructor(@Optional() protected readonly options?: ParseNumberStringPipeOptions) {
    options = options || {};

    const { exceptionFactory, errorHttpStatusCode = HttpStatus.BAD_REQUEST } = options;

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.exceptionFactory = exceptionFactory || ((error): any => new HttpErrorByCode[errorHttpStatusCode](error));
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async transform(value: string): Promise<string> {
    if (isNil(value) && this.options?.optional) {
      return value;
    }

    if (!isNumberString(value)) {
      throw this.exceptionFactory('Validation failed (numeric string is expected)');
    }

    return value;
  }
}
