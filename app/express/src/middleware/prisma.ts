import { ColorSchema, DateSchema, TimeSchema, z } from '@todo/lib/zod';
import {
  PrismaClient as OriginPrismaClient,
  Prisma,
  type ITXClientDenyList,
} from '@todo/prisma/client';
import { AichatModelSchema } from '@todo/prisma/schema';
import log4js from 'log4js';
import util from 'node:util';
import superjson from 'superjson';
import { env } from '~/lib/env';
import { MessageSchema } from '~/schema/AichatRouterSchema';

const log = log4js.getLogger('database');

export function generatePrisma(reqid: string) {
  const originPrisma = new OriginPrismaClient({
    log: ['info', 'warn', 'error', { emit: 'event', level: 'query' }],
  });

  originPrisma.$on('query', (event) => {
    log.mark(
      reqid,
      `QUERY::[${event.query};]`,
      event.params !== '[]' ? `PARAMS::${event.params}` : '',
    );
  });

  return originPrisma.$extends({
    query: {
      async $allOperations(params) {
        log.mark(reqid, `${params.operation}.${params.model} BEGIN`);
        const start = performance.now();

        const result = await params.query(params.args);

        const end = performance.now();
        log.mark(reqid, `${params.operation}.${params.model} END`, `took::${end - start}ms`);
        if (!env.PROD) {
          log.mark(
            reqid,
            'RESULT::',
            util.inspect(result, { showHidden: false, depth: null, colors: true }),
          );
        }
        return result;
      },
    },
    result: {
      user: {
        aichat_model: {
          needs: {
            aichat_model: true,
          },
          compute({ aichat_model }) {
            return AichatModelSchema.or(z.literal('')).parse(aichat_model);
          },
        },
      },
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
      aichat: {
        message: {
          needs: {
            message: true,
          },
          compute({ message }) {
            return superjson.parse<z.infer<typeof MessageSchema>>(message);
          },
        },
      },
    },
  });
}

export type ExtendsPrismaClient = ReturnType<typeof generatePrisma>;
export type TransactionExtendsPrismaClient = Omit<ExtendsPrismaClient, ITXClientDenyList>;

export type PrismaClient = ExtendsPrismaClient | TransactionExtendsPrismaClient;

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
