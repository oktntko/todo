import { ZodError } from '@todo/lib/zod';
import { User } from '@todo/prisma/client';
import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import superjson from 'superjson';
import { message } from '~/lib/message';
import { ExtendsPrismaClient, PrismaClient } from '~/middleware/prisma';
import { SessionService } from '~/middleware/session';

// The app's context - is generated for each incoming request
export function createContext(
  opts: Pick<trpcExpress.CreateExpressContextOptions, 'req' | 'res'>,
  prisma: PrismaClient = ExtendsPrismaClient,
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
export type PublicContext = {
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
          ? message.error.INTERNAL_SERVER_ERROR
          : opts.error.code === 'BAD_REQUEST' && opts.error.cause instanceof ZodError
            ? message.error.BAD_REQUEST
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
      message: message.error.UNAUTHORIZED,
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

export function authorizationProcedure(role: string | string[]) {
  const roles = Array.isArray(role) ? role : [role];
  const hasAuthority = isAuthed.unstable_pipe(({ next, ctx }) => {
    // TODO: ctx.operator.role との比較に修正
    if (!roles.includes(/* ctx.operator.role */ '')) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: message.error.FORBIDDEN,
      });
    }

    return next({
      ctx,
    });
  });

  return protectedProcedure.use(hasAuthority);
}

export function createExpressMiddleware(
  opts: Omit<Parameters<typeof trpcExpress.createExpressMiddleware>[0], 'createContext'>,
) {
  return trpcExpress.createExpressMiddleware({
    ...opts,
    createContext,
  });
}
