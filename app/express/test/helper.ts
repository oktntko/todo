import { z } from '@todo/lib/zod';
import type { Prisma, User } from '@todo/prisma/client';
import { UserSchema } from '@todo/prisma/schema';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express';
import { SessionData } from 'express-session';
import { HashPassword } from '~/lib/secret';
import {
  ExtendsPrismaClient,
  type PrismaClient,
  type TransactionExtendsPrismaClient,
} from '~/middleware/prisma';
import { SessionService } from '~/middleware/session';
import * as LibTrpc from '~/middleware/trpc';
import { createContext } from '~/middleware/trpc';
import { createCaller } from '~/router/_router';

// ID固定のテストユーザー
async function upsertTestUser(prisma: PrismaClient) {
  const user_id = crypto.randomUUID();
  return prisma.user.upsert({
    create: {
      user_id,
      email: `${user_id}@example.com`,
      password: HashPassword.hash('test@example.com'),
      username: 'test username',
      description: 'test description',
      twofa_enable: false,
      twofa_secret: '',
      aichat_api_key: '',
      aichat_enable: false,
      aichat_model: 'gpt-4.1',
      avatar_image: '',
      created_at: new Date(1997, 7, 17),
      updated_at: new Date(1997, 7, 17),
    },
    update: {
      email: 'test@example.com',
      password: HashPassword.hash('test@example.com'),
      username: 'test username',
      description: 'test description',
      twofa_enable: false,
      twofa_secret: '',
      aichat_api_key: '',
      aichat_enable: false,
      aichat_model: 'gpt-4.1',
      avatar_image: '',
      updated_at: new Date(1997, 7, 17),
    },
    where: {
      user_id,
    },
  });
}

async function $rollback(prisma: PrismaClient) {
  return prisma.$executeRaw`ROLLBACK;`;
}

/**
 * トランザクションロールバック
 */
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

/**
 * express用. 認証済み
 */
export async function transactionRollbackExpress<R>(
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

  function useMockContext(prisma: PrismaClient) {
    const mockContext = vi.spyOn(LibTrpc, 'createContext');
    mockContext.mockImplementationOnce((opts) => ({
      req: opts.req,
      res: opts.res,
      prisma,
    }));

    return {
      mockContext,
      restoreMockContext() {
        mockContext.mockRestore();
      },
    };
  }

  function useMockSession(operator: z.infer<typeof UserSchema>) {
    const mockSession = vi.spyOn(SessionService, 'findUserBySession');
    mockSession.mockResolvedValue(operator);

    return {
      mockSession,
      restoreMockSession() {
        mockSession.mockRestore();
      },
    };
  }
}

/**
 * trpc用. 認証済み
 */
export async function transactionRollbackTrpc<R>(
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

    const ctx = createContext(mockopts(operator), tx);
    const caller = createCaller(ctx);

    const result = await fn({ tx, caller, operator });

    await $rollback(tx);
    return result;
  }, options);
}

/**
 * trpc 用. createContext の引数モック
 */
export function mockopts(user: {
  user_id: string;
}): Pick<CreateExpressContextOptions, 'req' | 'res'> {
  const req = {
    session: {
      id: 'mock-session-id',
      destroy: vi.fn(),
      regenerate: vi.fn(),
      reload: vi.fn(),
      save: vi.fn(),
      touch: vi.fn(),
      resetMaxAge: vi.fn(),
      cookie: {
        originalMaxAge: 10000000000000,
        expires: new Date(9999, 12, 31),
      },
      // session data
      user_id: user.user_id,
      data: {},
    },
  };
  return {
    req: mockreq(req),
    res: mockres(),
  };

  function mockreq(req: { session: SessionData }): Request {
    return req as unknown as Request;
  }

  function mockres(): Response {
    return {} as unknown as Response;
  }
}
