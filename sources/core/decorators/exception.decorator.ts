import { capitalize } from '@common/functions';
import { AnyObject } from '@common/types';

type ExceptionEnum = {
  enumObject: AnyObject;
  name: string;
  tag: string | null;
};

const EXCEPTION_CODE = Symbol('exception_code');

const exceptionCodesMap = new Map<string | null, Set<string>>();

function checkAndSaveExceptionCode(tag: string | null, exceptionCode: string): void {
  const exceptionCodes = exceptionCodesMap.get(tag) ?? new Set();

  if (!exceptionCodesMap.has(tag)) {
    exceptionCodesMap.set(tag, exceptionCodes);
  }

  if (exceptionCodes.has(exceptionCode)) {
    throw new Error(`Exception code '${exceptionCode}' already used`);
  }

  exceptionCodes.add(exceptionCode);
}

function Exception(tag: string | null = null): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return <Constructor extends Function>(target: Constructor): void => {
    const exceptionCode = target.name;

    if (tag !== null) {
      checkAndSaveExceptionCode(null, exceptionCode);
    }

    checkAndSaveExceptionCode(tag, exceptionCode);

    Reflect.defineMetadata(EXCEPTION_CODE, exceptionCode, target);
  };
}

function getExceptionEnums(): ExceptionEnum[] {
  const exceptionEnums: ExceptionEnum[] = [];

  for (const [tag, exceptionCodesSet] of exceptionCodesMap) {
    const exceptionCodes = Array.from(exceptionCodesSet);
    const enumObjectEntries = exceptionCodes.map((exceptionCode) => [exceptionCode, exceptionCode] as const);
    const enumObject = Object.fromEntries(enumObjectEntries);

    const formattedTag = capitalize(tag ?? '');
    const name = `${formattedTag}ExceptionCode`;

    exceptionEnums.push({
      enumObject,
      name,
      tag,
    });
  }

  return exceptionEnums;
}

export { Exception, EXCEPTION_CODE, ExceptionEnum, getExceptionEnums };
