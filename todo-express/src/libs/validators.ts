import { ValidationError } from "class-validator";
import { BadRequestError } from "routing-controllers";

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

export const validateUploadedFile = (
  file: Express.Multer.File | undefined,
  options: { required?: boolean; mimetype?: string | null; fileSize?: number /*bytes*/ }
) => {
  if (file == null || !file.originalname || !file.mimetype || !file.size) {
    if (options.required) {
      throw new BadRequestError("ファイルを添付してください。");
    } else {
      return;
    }
  }

  if (options.mimetype && !file.mimetype.startsWith(options.mimetype)) {
    throw new BadRequestError("アップロードできないファイルです。");
  }

  if (options.fileSize && file.size > options.fileSize) {
    throw new BadRequestError(
      `アップロードできるファイルのサイズは ${(
        options.fileSize / 1000
      ).toLocaleString()}KB 以下です。`
    );
  }

  if (file.originalname.length > 100) {
    throw new BadRequestError("添付できるファイル名は100文字までです。");
  }
};
