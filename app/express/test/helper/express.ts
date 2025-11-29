import { z } from '@todo/lib/zod';
import { UserSchema } from '@todo/prisma/schema';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express';
import type { SessionData } from 'express-session';
import session from 'express-session';
import { HashPassword } from '~/lib/secret';
import type { PrismaClient } from '~/middleware/prisma';
import { SessionService } from '~/middleware/session';
import * as LibTrpc from '~/middleware/trpc';

export const TEST_USER_ID = '019ac0bc-e320-752b-a5cf-6233d23263d5';
export async function upsertTestUser(prisma: PrismaClient) {
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
}

function mockreq(req: { session: SessionData }): Request {
  return req as unknown as Request;
}

function mockres(): Response {
  return {} as unknown as Response;
}

export function useMockContext(prisma: PrismaClient) {
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
export function useMockSession(operator: z.infer<typeof UserSchema>) {
  const mockSession = vi.spyOn(SessionService, 'findUserBySession');
  mockSession.mockResolvedValue(operator);

  return {
    mockSession,
    restoreMockSession() {
      mockSession.mockRestore();
    },
  };
}
