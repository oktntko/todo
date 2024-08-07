import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { generatePrisma, PrismaClient } from '~/middleware/prisma.js';
import { SessionService } from '~/middleware/session.js';

// The app's context - is generated for each incoming request
export async function createContext(
  opts: trpcExpress.CreateExpressContextOptions,
  prisma: PrismaClient = generatePrisma(opts.req.reqid),
) {
  return {
    req: opts.req,
    res: opts.res,
    prisma,
  };
}

type Context = Awaited<ReturnType<typeof createContext>>;

// You can use any variable name you like.
// We use t to keep things simple.
const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    return {
      code: opts.shape.code, // TRPC_ERROR_CODE_NUMBER
      message:
        opts.error.code === 'INTERNAL_SERVER_ERROR'
          ? 'システムエラーが発生しました。'
          : opts.error.code === 'BAD_REQUEST' && opts.error.cause instanceof ZodError
            ? '入力値に誤りがあります。'
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
    throw new TRPCError({ code: 'UNAUTHORIZED' });
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
