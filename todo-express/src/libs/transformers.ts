import { TransformFnParams } from "class-transformer";
import { isNotEmpty, isNotEmptyObject } from "class-validator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type transformer = (params: TransformFnParams) => any;

export const transformerEmptyToNull: transformer = ({ value }: TransformFnParams) => {
  if (typeof value === "object") {
    return isNotEmptyObject(value) ? value : null;
  } else {
    return isNotEmpty(value) ? value : null;
  }
};
