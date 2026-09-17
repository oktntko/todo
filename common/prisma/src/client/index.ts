import type { ITXClientDenyList } from '@prisma/client/runtime/client';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from './generated/client';

const adapter = new PrismaMariaDb({
  host: process.env['DATABASE_HOST'],
  user: process.env['DATABASE_USER'],
  password: process.env['DATABASE_PASSWORD'],
  port: Number(process.env['DATABASE_PORT']),
  database: process.env['DATABASE_NAME'],
  connectTimeout: 5000,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error', { emit: 'event', level: 'query' }],
}).$extends({
  query: {
    $allModels: {
      async create({ args, query }) {
        args.data.created_at = new Date().toISOString();
        args.data.updated_at = new Date().toISOString();
        return query(args);
      },
      async update({ args, query }) {
        args.data.updated_at = new Date().toISOString();
        return query(args);
      },
      async updateMany({ args, query }) {
        args.data.updated_at = new Date().toISOString();
        return query(args);
      },
      async upsert({ args, query }) {
        args.create.created_at = new Date().toISOString();
        args.create.updated_at = new Date().toISOString();
        args.update.updated_at = new Date().toISOString();
        return query(args);
      },
    },
  },
});

type TransactionOriginPrismaClient = Omit<PrismaClient, ITXClientDenyList>;

export type OriginPrismaClient = PrismaClient | TransactionOriginPrismaClient;

export * from './generated/client';
export { adapter, prisma, PrismaMariaDb, type ITXClientDenyList };
