import type { Prisma, User } from '@todo/prisma/client';
import type { Request, Response } from 'express';

import { z } from '@todo/lib/zod';
import { UserSchema } from '@todo/prisma/schema';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { SessionData } from 'express-session';

import {
  ExtendsPrismaClient,
  type PrismaClient,
  type TransactionExtendsPrismaClient,
} from '~/middleware/prisma';
import { SessionService } from '~/middleware/session';
import * as LibTrpc from '~/middleware/trpc';
import { createContext } from '~/middleware/trpc';
import { createCaller } from '~/router/_router';

import { UserFactory } from './factory/UserFactory';
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
    const operator = await UserFactory.create(tx);

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
    mockContext.mockImplementationOnce((opts) => {
      const csrfToken = crypto.randomUUID();
      opts.req.session.data = {
        csrfToken,
      };
      opts.req.cookies = {
        'csrf-token': csrfToken,
      };
      opts.req.headers = {
        'x-csrf-token': csrfToken,
      };

      return {
        req: opts.req,
        res: opts.res,
        prisma,
      };
    });

    return {
      mockContext,
      restoreMockContext: () => {
        mockContext.mockRestore();
      },
    };
  }

  function useMockSession(operator: z.infer<typeof UserSchema>) {
    const mockSession = vi.spyOn(SessionService, 'findUserBySession');
    mockSession.mockResolvedValue(operator);

    return {
      mockSession,
      restoreMockSession: () => {
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
    operator: Awaited<ReturnType<typeof UserFactory.create>>;
  }) => Promise<R>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
) {
  return prisma.$transaction(async (tx) => {
    const operator = await UserFactory.create(tx);

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
  const csrfToken = crypto.randomUUID();
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
      data: {
        csrfToken,
      },
    },
    cookies: {
      'csrf-token': csrfToken,
    },
    headers: {
      'x-csrf-token': csrfToken,
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
