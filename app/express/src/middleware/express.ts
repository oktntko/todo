import { z } from '@todo/lib/zod';
import { User } from '@todo/prisma/client';
import { TRPCError } from '@trpc/server';
import type { ErrorRequestHandler, Request, RequestHandler, Response } from 'express';
import { NextFunction } from 'express-serve-static-core';
import crypto from 'node:crypto';
import { log } from '~/lib/log4js';
import { message } from '~/lib/message';
import { type PrismaClient } from '~/middleware/prisma';
import { SessionService } from '~/middleware/session';
import { createContext } from '~/middleware/trpc';

// Custom Request
// node_modules/@types/express-session/index.d.ts
declare module 'http' {
  interface IncomingMessage {
    reqid: crypto.UUID;
  }
}

export const InjectRequestIdHandler: RequestHandler = (req, _, next) => {
  req.reqid = crypto.randomUUID();

  return next();
};

// Error Handler
export const ErrorHandler: ErrorRequestHandler = (err, _, res, next) => {
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
        case 'PRECONDITION_REQUIRED':
          return 428;
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
export const NotFoundHandler: RequestHandler = (_, res, next) => {
  if (res.headersSent) {
    return next();
  }

  res.status(404).json({
    code: 'NOT_FOUND',
    message: message.error.NOT_FOUND,
  });
};

// UNEXPECTED ERROR
export const UnexpectedErrorHandler: ErrorRequestHandler = (err, _, res, next) => {
  log.error(err);
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: message.error.INTERNAL_SERVER_ERROR,
  });
};

// Logger
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

// createHandler
export function createHandler<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  resolver: (opts: {
    ctx: {
      req: Request;
      reqid: string;
      res: Response;
      prisma: PrismaClient;
      next: NextFunction;
    };
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
            message: message.error.BAD_REQUEST,
          }),
        );
      }

      return await resolver({
        ctx: { ...ctx, reqid: req.reqid, next },
        input: result.data,
      });
    } catch (e) {
      return next(e);
    }
  };

  return handler;
}

export function createProtectHandler<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  resolver: (opts: {
    ctx: {
      req: Request;
      reqid: string;
      res: Response;
      prisma: PrismaClient;
      next: NextFunction;
      operator: User;
    };
    input: z.infer<typeof schema>;
  }) => Promise<void> | void,
): RequestHandler {
  const handler: RequestHandler = async (req, res, next) => {
    try {
      const ctx = createContext({ req, res });

      const user = await SessionService.findUserBySession({
        expires: ctx.req.session.cookie.expires,
        user_id: ctx.req.session.user_id,
      });

      if (user == null) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: message.error.UNAUTHORIZED,
        });
      }

      const result = schema.safeParse(req);
      if (result.error) {
        return next(
          new TRPCError({
            code: 'BAD_REQUEST',
            message: message.error.BAD_REQUEST,
          }),
        );
      }

      return resolver({
        ctx: { ...ctx, reqid: req.reqid, operator: user, next },
        input: result.data,
      });
    } catch (e) {
      return next(e);
    }
  };

  return handler;
}
