/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from "routing-controllers";
import log from "~/middlewares/log";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(err: any, _: Request, res: Response, next: (err?: any) => any) {
    if (err instanceof HttpError) {
      log.warn(err);
      res.status(err.httpCode).send({
        message: err.message,
      });
    } else {
      log.error(err);
      res.status(500).send({
        message: "リクエストに失敗しました",
      });
    }

    next();
  }
}
