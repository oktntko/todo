import { ZodError } from '@todo/lib/zod';
import { User } from '@todo/prisma/client';
import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import superjson from 'superjson';
import { generatePrisma, PrismaClient } from '~/middleware/prisma';
import { SessionService } from '~/middleware/session';
import {
  MESSAGE_INPUT_INVALID,
  MESSAGE_INTERNAL_SERVER_ERROR,
  MESSAGE_UNAUTHORIZED,
} from '~/repository/_repository';

// The app's context - is generated for each incoming request
export function createContext(
  opts: Pick<trpcExpress.CreateExpressContextOptions, 'req' | 'res'>,
  prisma: PrismaClient = generatePrisma(opts.req.reqid),
): {
  req: trpcExpress.CreateExpressContextOptions['req'];
  reqid: string;
  res: trpcExpress.CreateExpressContextOptions['res'];
  prisma: PrismaClient;
} {
  return {
    req: opts.req,
    reqid: opts.req.reqid,
    res: opts.res,
    prisma,
  };
}

type Context = ReturnType<typeof createContext>;
export type PublicContext = {
  reqid: string;
  prisma: PrismaClient;
};

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

  if (user == null) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: MESSAGE_UNAUTHORIZED,
    });
  }

  return next({
    ctx: {
      ...ctx,
      operator: user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(isAuthed);
export type ProtectedContext = PublicContext & {
  operator: User;
};

export function createExpressMiddleware(
  opts: Omit<Parameters<typeof trpcExpress.createExpressMiddleware>[0], 'createContext'>,
) {
  return trpcExpress.createExpressMiddleware({
    ...opts,
    createContext,
  });
}
