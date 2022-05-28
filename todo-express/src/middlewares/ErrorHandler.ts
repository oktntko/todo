/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationError } from "class-validator";
import { Request, Response } from "express";
import { isHttpError } from "http-errors";
import {
  BadRequestError,
  ExpressErrorMiddlewareInterface,
  HttpError,
  Middleware,
} from "routing-controllers";
import { transformValidationErrors } from "~/libs/validators";
import log from "~/middlewares/log";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(err: any, _: Request, res: Response, next: (err?: any) => any) {
    // # routing-controllers のエラー
    if (err instanceof HttpError) {
      err.httpCode < 500 ? log.warn(err) : log.error(err);

      if (isClassValidatorHttpError(err)) {
        // + class-validator のエラー
        const constraints = transformValidationErrors(err.errors);

        res.status(err.httpCode).send({
          name: err.name,
          message: "入力値に誤りがあります。",
          constraints,
        });

        // + routing-controllers のエラー
      } else {
        res.status(err.httpCode).send({
          name: err.name,
          message: err.message,
        });
      }

      // # body-parser のエラー
    } else if (isHttpError(err)) {
      err.status < 500 ? log.warn(err) : log.error(err);

      res.status(err.status).send({
        name: err.name,
        message: err.message,
      });

      // # それ以外のエラー
    } else if (err instanceof Error) {
      log.error(err);

      res.status(500).send({
        name: err.name,
        message: err.message,
      });

      // # 予期せぬエラー
    } else {
      log.error(err);

      res.status(500).send({
        name: "UNEXPECTED ERROR",
        message: "予期せぬエラーが発生しました。",
      });
    }

    next();
  }
}

class ClassValidatorHttpError extends BadRequestError {
  errors: ValidationError[];
}

const isClassValidatorHttpError = (err: HttpError): err is ClassValidatorHttpError => {
  // @ts-ignore
  if (!Array.isArray(err.errors)) return false;

  // @ts-ignore
  const errors: any[] = err.errors;
  return errors.every((error) => error instanceof ValidationError);
};

export class ConflictError extends HttpError {
  constructor(message?: string) {
    super(409, message || "競合しています。");
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class AlreadyExistsError extends ConflictError {
  readonly name = "AlreadyExistsError";
  constructor(message?: string) {
    super(message || "既に存在しています。");
    Object.setPrototypeOf(this, AlreadyExistsError.prototype);
  }
}

export class UpdateConflictsError extends ConflictError {
  readonly name = "UpdateConflictsError";
  constructor(message?: string) {
    super(message || "更新が競合しています。");
    Object.setPrototypeOf(this, UpdateConflictsError.prototype);
  }
}

export class NotExistsError extends ConflictError {
  readonly name = "NotExistsError";
  constructor(message?: string) {
    super(message || "データが存在しません。");
    Object.setPrototypeOf(this, NotExistsError.prototype);
  }
}
