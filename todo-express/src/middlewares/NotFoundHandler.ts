/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware, NotFoundError } from "routing-controllers";

@Middleware({ type: "after" })
export class NotFoundHandler implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: (err?: any) => any) {
    if (!res.headersSent) {
      throw new NotFoundError();
    } else {
      next();
    }
  }
}
