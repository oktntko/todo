import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { Request, Response } from 'express';
import { SessionData } from 'express-session';
import { PrismaClient } from '~/middleware/prisma';
import * as LibTrpc from '~/middleware/trpc';

export function mockopts(
  req: {
    session: SessionData;
  } = {
    session: {
      cookie: {
        originalMaxAge: 10000000000000,
        expires: new Date(9999, 12, 31),
      },
      user_id: 1,
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

export function mockCreateContext(prisma: PrismaClient) {
  const ctx = vi.spyOn(LibTrpc, 'createContext');
  ctx.mockImplementationOnce((opts) => ({
    req: opts.req,
    res: opts.res,
    prisma,
  }));

  return ctx;
}
