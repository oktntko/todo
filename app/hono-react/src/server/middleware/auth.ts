import type { z } from '@todo/lib';
import type { UserSchema } from '@todo/prisma/schema';
import type { Context } from 'hono';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';

import { env } from '@/lib/env';
import { message } from '@/lib/message';
import { StatusCode, type PublicEnv } from '@/middleware/hono';
import { UserRepository } from '@/repository/UserRepository';

// cookie
export const COOKIE_AUTH_TOKEN_KEY = 'auth_token';

// jwt
export const ALGORITHM_TYPE = 'HS256';
export type AuthPayload = {
  user_id: string;
} & JWTPayload;

export type Operator = z.infer<typeof UserSchema>;
export type OperatorMinimum = Pick<Operator, 'user_id'>;

// ctx
export type ProtectedEnv = {
  Variables: PublicEnv['Variables'] & { operator: Operator };
};
export type ProtectedContext = Context<ProtectedEnv>;

export const requireAuth = createMiddleware<ProtectedEnv>(async (c, next) => {
  const token = getCookie(c, COOKIE_AUTH_TOKEN_KEY);

  if (!token) {
    throw new HTTPException(StatusCode.UNAUTHORIZED, { message: message.error.UNAUTHORIZED });
  }

  const payload = await verify(token, env.secret.JWT_SECRET, ALGORITHM_TYPE);
  const user_id = payload['user_id'];

  if (typeof user_id !== 'string') {
    throw new HTTPException(StatusCode.UNAUTHORIZED, { message: message.error.UNAUTHORIZED });
  }

  const operator = await UserRepository.findUniqueUser(c.var.prisma, {
    where: {
      user_id,
    },
  });

  if (operator == null) {
    throw new HTTPException(StatusCode.UNAUTHORIZED, { message: message.error.UNAUTHORIZED });
  }

  c.set('operator', operator);
  return next();
});
