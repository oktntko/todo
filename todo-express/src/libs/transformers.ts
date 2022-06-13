import { TransformFnParams } from "class-transformer";
import { isNotEmpty, isNotEmptyObject, isNumber, isNumberString } from "class-validator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type transformer = (params: TransformFnParams) => any;

export const transformerEmptyToNull: transformer = ({ value }: TransformFnParams) => {
  if (typeof value === "object") {
    return isNotEmptyObject(value) ? value : null;
  } else {
    return isNotEmpty(value) ? value : null;
  }
};

export const transformerStringToNumber: transformer = ({ value }: TransformFnParams) => {
  if (isNumberString(value) || isNumber(value)) {
    return Number(value);
  } else {
    return value;
  }
};
