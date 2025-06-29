import { ZodError } from '-lib/zod';
import { generatePrisma, PrismaClient } from '-prisma/client';
import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import superjson from 'superjson';
import { log } from '~/lib/log4js';
import { SessionService } from '~/middleware/session';
import {
  MESSAGE_INPUT_INVALID,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_UNAUTHORIZED,
} from '~/repository/_repository';

// The app's context - is generated for each incoming request
export function createContext(
  opts: Pick<trpcExpress.CreateExpressContextOptions, 'req' | 'res'>,
  prisma: PrismaClient = generatePrisma(opts.req.reqid, { logFunc: log.mark }),
): {
  req: trpcExpress.CreateExpressContextOptions['req'];
  res: trpcExpress.CreateExpressContextOptions['res'];
  prisma: PrismaClient;
} {
  return {
    req: opts.req,
    res: opts.res,
    prisma,
  };
}

type Context = ReturnType<typeof createContext>;

// You can use any variable name you like.
// We use t to keep things simple.
const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    return {
      code: opts.shape.code, // TRPC_ERROR_CODE_NUMBER
      message:
        opts.error.code === 'INTERNAL_SERVER_ERROR'
          ? MESSAGE_INTERNAL_SERVER_ERROR
          : opts.error.code === 'BAD_REQUEST' && opts.error.cause instanceof ZodError
            ? MESSAGE_INPUT_INVALID
            : opts.shape.message, // string,
      data: {
        httpStatus: opts.shape.data.httpStatus,
        code: opts.error.code, // TRPC_ERROR_CODE_KEY
        path: opts.shape.data.path,
        cause:
          opts.error.code === 'BAD_REQUEST' && opts.error.cause instanceof ZodError
            ? opts.error.cause.flatten()
            : undefined,
      },
    };
  },
  transformer: superjson, // Date to Date
});

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = procedure;

/**
 * Reusable middleware that checks if users are authenticated.
 **/
const isAuthed = middleware(async ({ next, ctx }) => {
  const user = await SessionService.findUserBySession({
    expires: ctx.req.session.cookie.expires,
    user_id: ctx.req.session.user_id,
  });
  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: MESSAGE_UNAUTHORIZED,
    });
  }

  return next({
    ctx: {
      ...ctx,
      operator_id: user.user_id,
    },
  });
});

export const protectedProcedure = publicProcedure.use(isAuthed);

export function createExpressMiddleware(
  opts: Omit<Parameters<typeof trpcExpress.createExpressMiddleware>[0], 'createContext'>,
) {
  return trpcExpress.createExpressMiddleware({
    ...opts,
    createContext,
  });
}
