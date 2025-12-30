import { z } from '@todo/lib/zod';
import type { Prisma, User } from '@todo/prisma/client';
import { UserSchema } from '@todo/prisma/schema';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express';
import session, { SessionData } from 'express-session';
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
export const TEST_USER_ID = '019ac0bc-e320-752b-a5cf-6233d23263d5';

async function upsertTestUser(prisma: PrismaClient) {
  return prisma.user.upsert({
    create: {
      user_id: TEST_USER_ID,
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
      user_id: TEST_USER_ID,
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

    const ctx = createContext(mockopts(), tx);
    const caller = createCaller(ctx);

    const result = await fn({ tx, caller, operator });

    await $rollback(tx);
    return result;
  }, options);
}

/**
 * trpc 用. createContext の引数モック
 */
export function mockopts(
  req: {
    session: session.Session & Partial<session.SessionData>;
  } = {
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
      user_id: TEST_USER_ID,
      data: {},
    },
  },
): Pick<CreateExpressContextOptions, 'req' | 'res'> {
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
