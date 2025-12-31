import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import type { ITXClientDenyList } from '@prisma/client/runtime/client';
import { PrismaClient } from './generated/client';

const adapter = new PrismaMariaDb({
  host: process.env['DATABASE_HOST'],
  user: process.env['DATABASE_USER'],
  password: process.env['DATABASE_PASSWORD'],
  port: Number(process.env['DATABASE_PORT']),
  database: process.env['DATABASE_NAME'],
  connectTimeout: 5000,
});

type TransactionOriginPrismaClient = Omit<PrismaClient, ITXClientDenyList>;

export type OriginPrismaClient = PrismaClient | TransactionOriginPrismaClient;

export * from './generated/client';
export { adapter, PrismaMariaDb, type ITXClientDenyList };
