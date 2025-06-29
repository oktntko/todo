import type { ITXClientDenyList } from '@prisma/client/runtime/library';
import { inspect } from 'node:util';
import { PrismaClient as P, Prisma } from '../generated/client';

export const OriginPrismaClient = P;

export * from '../generated/client';

export function generatePrisma(
  reqid: string,
  {
    logFunc,
  }: {
    logFunc?: (message: unknown, ...args: unknown[]) => void;
  } = {},
) {
  const originPrisma = new OriginPrismaClient({
    log: ['info', 'warn', 'error', { emit: 'event', level: 'query' }],
  });

  originPrisma.$on('query', (event) => {
    logFunc?.(
      reqid,
      `QUERY::[${event.query};]`,
      event.params !== '[]' ? `PARAMS::${event.params}` : '',
    );
  });

  return originPrisma.$extends({
    query: {
      async $allOperations(params) {
        logFunc?.(reqid, `${params.operation}.${params.model} BEGIN`);
        const start = performance.now();

        const result = await params.query(params.args);

        const end = performance.now();
        logFunc?.(reqid, `${params.operation}.${params.model} END`, `took::${end - start}ms`);
        // TODO only prod
        logFunc?.(
          reqid,
          'RESULT::',
          inspect(result, { showHidden: false, depth: null, colors: true }),
        );

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
