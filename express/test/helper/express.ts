import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { TRPCRequestInfo } from '@trpc/server/http';
import type { Request, Response } from 'express';
import { SessionData } from 'express-session';

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
): CreateExpressContextOptions {
  return {
    req: mockreq(req),
    res: mockres(),
    info: mockinfo(),
  };
}

function mockreq(req: { session: SessionData }): Request {
  return req as unknown as Request;
}

function mockres(): Response {
  return {} as unknown as Response;
}

function mockinfo(): TRPCRequestInfo {
  return {} as unknown as TRPCRequestInfo;
}
