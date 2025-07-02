import {
  PrismaClient as OriginPrismaClient,
  Prisma,
  type ITXClientDenyList,
} from '@todo/prisma/client';
import log4js from 'log4js';
import util from 'node:util';
import { env } from '~/lib/env';

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
