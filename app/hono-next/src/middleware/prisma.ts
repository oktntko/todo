import { ColorSchema, DateSchema, TimeSchema, z } from '@todo/lib';
import { prisma, Prisma, type ITXClientDenyList } from '@todo/prisma/client';
import { AichatRoleSchema } from '@todo/prisma/schema';

import { ReqCtx } from '~/lib/context';
import { env } from '~/lib/env';

export const ExtendsPrismaClient = prisma.$extends({
  query: {
    async $allOperations(params) {
      console.debug({ reqid: ReqCtx.reqid }, `${params.operation ?? ''}.${params.model} BEGIN`);
      const start = performance.now();

      const result = await params.query(params.args);

      const end = performance.now();
      console.debug(
        { reqid: ReqCtx.reqid },
        `${params.operation ?? ''}.${params.model} END took ${end - start} ms`,
      );
      if (!env.PROD) {
        console.debug(
          { reqid: ReqCtx.reqid, result },
          `${params.operation ?? ''}.${params.model} RESULT`,
        );
      }
      return result;
    },
  },
  result: {
    user: {},
    space: {
      space_color: {
        needs: {
          space_color: true,
        },
        compute({ space_color }) {
          return ColorSchema.or(z.literal('')).parse(space_color);
        },
      },
    },
    group: {
      group_color: {
        needs: {
          group_color: true,
        },
        compute({ group_color }) {
          return ColorSchema.or(z.literal('')).parse(group_color);
        },
      },
    },
    todo: {
      begin_date: {
        needs: {
          begin_date: true,
        },
        compute({ begin_date }) {
          return DateSchema.or(z.literal('')).parse(begin_date);
        },
      },
      begin_time: {
        needs: {
          begin_time: true,
        },
        compute({ begin_time }) {
          return TimeSchema.or(z.literal('')).parse(begin_time);
        },
      },
      limit_date: {
        needs: {
          limit_date: true,
        },
        compute({ limit_date }) {
          return DateSchema.or(z.literal('')).parse(limit_date);
        },
      },
      limit_time: {
        needs: {
          limit_time: true,
        },
        compute({ limit_time }) {
          return TimeSchema.or(z.literal('')).parse(limit_time);
        },
      },
    },
    aichatMessage: {
      role: {
        needs: {
          role: true,
        },
        compute({ role }) {
          return AichatRoleSchema.parse(role);
        },
      },
    },
  },
});

export type TransactionExtendsPrismaClient = Omit<typeof ExtendsPrismaClient, ITXClientDenyList>;

export type PrismaClient = typeof ExtendsPrismaClient | TransactionExtendsPrismaClient;

export async function $transaction<R>(
  prisma: PrismaClient,
  fn: (prisma: PrismaClient) => Promise<R>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
) {
  if ('$transaction' in prisma && prisma.$transaction) {
    return prisma.$transaction(fn, options);
  } else {
    return fn(prisma);
  }
}

// Symbol.for('nodejs.util.inspect.custom') をはずす
export function removeSymbol<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeSymbol(item)) as unknown as T;
  }

  const entries = Object.entries(obj).map(([key, value]) => [key, removeSymbol(value)]);

  return Object.fromEntries(entries) as T;
}
