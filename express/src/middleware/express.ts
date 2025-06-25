import { TRPCError } from '@trpc/server';
import type { ErrorRequestHandler, Request, RequestHandler, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import crypto from 'node:crypto';
import { log } from '~/lib/log4js';
import { z } from '~/lib/zod';
import { PrismaClient } from '~/middleware/prisma';
import { SessionService } from '~/middleware/session';
import { createContext } from '~/middleware/trpc';
import {
  MESSAGE_INPUT_INVALID,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_UNAUTHORIZED,
} from '~/repository/_repository';

// # Custom Request
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

// # Error Handler
export const ErrrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next();
  }

  if (err instanceof TRPCError) {
    const status = (function () {
      switch (err.code) {
        case 'PARSE_ERROR':
          return 500;
        case 'BAD_REQUEST':
          return 400;
        case 'INTERNAL_SERVER_ERROR':
          return 500;
        case 'NOT_IMPLEMENTED':
          return 501;
        case 'BAD_GATEWAY':
          return 502;
        case 'SERVICE_UNAVAILABLE':
          return 503;
        case 'GATEWAY_TIMEOUT':
          return 504;
        case 'UNAUTHORIZED':
          return 401;
        case 'PAYMENT_REQUIRED':
          return 402;
        case 'FORBIDDEN':
          return 403;
        case 'NOT_FOUND':
          return 404;
        case 'METHOD_NOT_SUPPORTED':
          return 405;
        case 'TIMEOUT':
          return 408;
        case 'CONFLICT':
          return 409;
        case 'PRECONDITION_FAILED':
          return 412;
        case 'PAYLOAD_TOO_LARGE':
          return 413;
        case 'UNSUPPORTED_MEDIA_TYPE':
          return 415;
        case 'UNPROCESSABLE_CONTENT':
          return 422;
        case 'TOO_MANY_REQUESTS':
          return 429;
        case 'CLIENT_CLOSED_REQUEST':
          return 499;
      }
    })();
    res.status(status).json({
      code: err.code,
      message: err.message,
    });
  } else {
    return next(err);
  }
};

// NOT FOUND ERROR
export const NotFoundHandler: RequestHandler = (req, res, next) => {
  if (res.headersSent) {
    return next();
  }

  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'アクセス先が見つかりません。',
  });
};

// UNEXPECTED ERROR
export const UnexpectedErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  log.error(err);
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: MESSAGE_INTERNAL_SERVER_ERROR,
  });
};

// # Logger
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

// # createHandler
export function createHandler<T extends z.ZodRawShape>(
  schema: z.ZodEffects<z.ZodObject<T>> | z.ZodObject<T>,
  resolver: (opts: {
    ctx: { req: Request; res: Response; prisma: PrismaClient; next: NextFunction };
    input: z.infer<typeof schema>;
  }) => Promise<void> | void,
): RequestHandler {
  const handler: RequestHandler = async (req, res, next) => {
    try {
      const ctx = createContext({ req, res });

      const result = schema.safeParse(req);
      if (result.error) {
        return next(
          new TRPCError({
            code: 'BAD_REQUEST',
            message: MESSAGE_INPUT_INVALID,
          }),
        );
      }

      return await resolver({
        ctx: { ...ctx, next },
        input: result.data,
      });
    } catch (e) {
      return next(e);
    }
  };

  return handler;
}

export function createProtectHandler<T extends z.ZodRawShape>(
  schema: z.ZodEffects<z.ZodObject<T>> | z.ZodObject<T>,
  resolver: (opts: {
    ctx: {
      req: Request;
      res: Response;
      prisma: PrismaClient;
      next: NextFunction;
      operator_id: number;
    };
    input: z.infer<typeof schema>;
  }) => Promise<void> | void,
): RequestHandler {
  const handler: RequestHandler = async (req, res, next) => {
    try {
      const ctx = createContext({ req, res });

      const user = await SessionService.findUserBySession({
        expires: req.session.cookie.expires,
        user_id: req.session.user_id,
      });
      if (!user) {
        return next(
          new TRPCError({
            code: 'UNAUTHORIZED',
            message: MESSAGE_UNAUTHORIZED,
          }),
        );
      }

      const result = schema.safeParse(req);
      if (result.error) {
        return next(
          new TRPCError({
            code: 'BAD_REQUEST',
            message: MESSAGE_INPUT_INVALID,
          }),
        );
      }

      return resolver({
        ctx: { ...ctx, next, operator_id: user.user_id },
        input: result.data,
      });
    } catch (e) {
      return next(e);
    }
  };

  return handler;
}
