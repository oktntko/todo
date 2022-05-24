/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { ExpressErrorMiddlewareInterface, Middleware } from "routing-controllers";
import log from "~/middlewares/log";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(err: any, _: Request, res: Response, next: (err?: any) => any) {
    log.error(err);
    res.status(500).send({
      message: "リクエストに失敗しました",
    });

    next();
  }
}
