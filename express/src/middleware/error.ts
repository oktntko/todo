import type { ErrorRequestHandler, RequestHandler } from 'express';
import { log } from '~/lib/log4js.js';

// NOT FOUND ERROR
export const NotFoundHandler: RequestHandler = (req, res, next) => {
  if (res.headersSent) {
    return next();
  }

  res.status(404).send({
    message: 'アクセス先が見つかりません。',
  });
};

// UNEXPECTED ERROR
export const UnexpectedErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  log.error(err);
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).send({
    message: 'システムエラーが発生しました。',
  });
};
