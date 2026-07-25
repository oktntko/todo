import { ColorSchema, DateSchema, TimeSchema, z } from '@todo/lib/zod';
import {
  adapter,
  PrismaClient as OriginPrismaClient,
  Prisma,
  type ITXClientDenyList,
} from '@todo/prisma/client';
import { AichatRoleSchema } from '@todo/prisma/schema';

import { ReqCtx } from '~/lib/context';
import { env } from '~/lib/env';
import { log } from '~/lib/logger';

export const ExtendsPrismaClient = new OriginPrismaClient({
  adapter,
  log: ['warn', 'error', { emit: 'event', level: 'query' }],
})
  .$on('query', (event) => {
    log.trace(
      { reqid: ReqCtx.reqid, query: event.query, params: JSON.parse(event.params) },
      'query',
    );
  })
  .$extends({
    query: {
      async $allOperations(params) {
        log.trace({ reqid: ReqCtx.reqid }, '%s.%s BEGIN', params.operation ?? '', params.model);
        const start = performance.now();

        const result = await params.query(params.args);

        const end = performance.now();
        log.trace(
          { reqid: ReqCtx.reqid },
          '%s.%s END took %d ms',
          params.operation ?? '',
          params.model,
          end - start,
        );
        if (!env.PROD) {
          log.trace(
            { reqid: ReqCtx.reqid, result },
            '%s.%s RESULT',
            params.operation ?? '',
            params.model,
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
