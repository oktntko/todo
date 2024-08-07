import type { RequestHandler } from 'express';
import crypto from 'node:crypto';

// node_modules/@types/express-session/index.d.ts
declare module 'http' {
  interface IncomingMessage {
    reqid: crypto.UUID;
  }
}

export const InjectRequestIdHandler: RequestHandler = (req, res, next) => {
  req.reqid = crypto.randomUUID();

  return next();
};
