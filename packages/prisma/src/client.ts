import type { ITXClientDenyList } from '@prisma/client/runtime/library';
import { PrismaClient } from '../generated/client';

export const prisma = new PrismaClient({});

type TransactionOriginPrismaClient = Omit<PrismaClient, ITXClientDenyList>;

export type OriginPrismaClient = PrismaClient | TransactionOriginPrismaClient;

export * from '../generated/client';
export { type ITXClientDenyList };
