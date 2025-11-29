import type { Prisma, User } from '@todo/prisma/client';
import {
  ExtendsPrismaClient,
  type PrismaClient,
  type TransactionExtendsPrismaClient,
} from '~/middleware/prisma';
import { createContext } from '~/middleware/trpc';
import { createCaller } from '~/router/_router';
import { mockopts, upsertTestUser, useMockContext, useMockSession } from './express';

async function $rollback(prisma: PrismaClient) {
  return prisma.$executeRaw`ROLLBACK;`;
}

export async function transactionRollback<R>(
  prisma: typeof ExtendsPrismaClient,
  fn: (params: { tx: TransactionExtendsPrismaClient }) => Promise<R>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
) {
  return prisma.$transaction(async (tx) => {
    const result = await fn({ tx });
    await $rollback(prisma);
    return result;
  }, options);
}

export async function transactionRollbackUseMockContext<R>(
  prisma: typeof ExtendsPrismaClient,
  fn: (params: { tx: TransactionExtendsPrismaClient }) => Promise<R>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
) {
  return prisma.$transaction(async (tx) => {
    const { restoreMockContext } = useMockContext(tx);

    try {
      const result = await fn({ tx });

      await $rollback(tx);
      return result;
    } finally {
      restoreMockContext();
    }
  }, options);
}

export async function transactionRollbackUseMockSession<R>(
  prisma: typeof ExtendsPrismaClient,
  fn: (params: { tx: TransactionExtendsPrismaClient; operator: User }) => Promise<R>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
) {
  return prisma.$transaction(async (tx) => {
    const operator = await upsertTestUser(tx);
    const { restoreMockContext } = useMockContext(tx);
    const { restoreMockSession } = useMockSession(operator);

    try {
      const result = await fn({ tx, operator });

      await $rollback(tx);
      return result;
    } finally {
      restoreMockContext();
      restoreMockSession();
    }
  }, options);
}

export async function transactionRollbackUseCaller<R>(
  prisma: typeof ExtendsPrismaClient,
  fn: (params: {
    tx: TransactionExtendsPrismaClient;
    caller: ReturnType<typeof createCaller>;
    operator: Awaited<ReturnType<typeof upsertTestUser>>;
  }) => Promise<R>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
) {
  return prisma.$transaction(async (tx) => {
    const operator = await upsertTestUser(tx);

    const ctx = createContext(mockopts(), tx);
    const caller = createCaller(ctx);

    const result = await fn({ tx, caller, operator });

    await $rollback(tx);
    return result;
  }, options);
}
