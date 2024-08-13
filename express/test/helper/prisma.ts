import { Prisma } from '@prisma/client';
import {
  ExtendsPrismaClient,
  PrismaClient,
  TransactionExtendsPrismaClient,
} from '~/middleware/prisma.js';

export async function transactionRollback<R>(
  prisma: ExtendsPrismaClient,
  fn: (prisma: TransactionExtendsPrismaClient) => Promise<R>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
) {
  return prisma.$transaction(async (prisma) => {
    const result = await fn(prisma);
    await $rollback(prisma);
    return result;
  }, options);
}

async function $rollback(prisma: PrismaClient) {
  return prisma.$executeRaw`ROLLBACK;`;
}
