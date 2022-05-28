import { ValidationError } from "class-validator";

export const transformValidationErrors = (errors: ValidationError[]): ValidationObject => {
  return errors.reduce((obj, ve: ValidationError): ValidationObject => {
    if (!ve.children || !ve.children.length) {
      if (ve.constraints) {
        obj[ve.property] = Object.entries(ve.constraints).map(([constraint, message]) => ({
          constraint,
          message,
        }));
      }
    } else {
      obj[ve.property] = transformValidationErrors(ve.children);
    }
    return obj;
  }, {} as ValidationObject);
};

export type ValidationObject = {
  [key: string]: { constraint: string; message: string }[] | ValidationObject;
};
