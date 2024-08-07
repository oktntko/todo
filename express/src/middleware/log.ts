import type { Request, RequestHandler, Response } from 'express';
import { log } from '~/lib/log4js.js';

// "GET /api/trpc/status.list HTTP/1.1" 200 - "http://localhost:5173/setting/status"
export const LogHandler: RequestHandler = (req, res, next) => {
  log.info(formatAccessInfo('BEGIN', req));

  res.on('finish', () => {
    log.info(formatAccessInfo('FINISH', req, res));
  });

  return next();
};

function formatAccessInfo(prefix: string, req: Request, res?: Response) {
  return `${req.reqid} ${prefix} - "${req.method} ${decodeURIComponent(req.originalUrl || req.url)}" ${
    res?.statusCode ?? '( )'
  } - ${req.headers['x-forwarded-for'] || req.ip}`;
}
