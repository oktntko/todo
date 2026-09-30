import type { User } from '@todo/prisma/client';
import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { env } from '~/lib/env';
import { message } from '~/lib/message';
import { UserRepository } from '~/repository/UserRepository';

import { PublicEnv, StatusCode } from './hono';

// cookie
export const COOKIE_KEY = {
  AUTH_TOKEN: 'auth_token',
  AUTH_TWOFA: 'auth_twofa',
  MYPAGE_TWOFA_SECRET: 'mypage_twofa_secret',
};

// jwt
export const ALGORITHM_TYPE = 'HS256';
export type AuthPayload = {
  user_id: string;
} & JWTPayload;
export type TwofaSecretPayload = {
  twofa_secret: string;
} & JWTPayload;

export type Operator = User;
export type OperatorMinimum = Pick<Operator, 'user_id'>;

// ctx
export type ProtectedEnv = {
  Variables: PublicEnv['Variables'] & { operator: Operator };
};
export type ProtectedContext = Context<ProtectedEnv>;

export const requireAuth = createMiddleware<ProtectedEnv>(async (c, next) => {
  const token = getCookie(c, COOKIE_KEY.AUTH_TOKEN);

  if (!token) {
    throw new HTTPException(StatusCode.UNAUTHORIZED, { message: message.error.UNAUTHORIZED });
  }

  const payload = await verify(token, env.secret.JWT_SECRET, ALGORITHM_TYPE).catch((e) => {
    console.error(e);
    throw new HTTPException(StatusCode.UNAUTHORIZED, { message: message.error.UNAUTHORIZED });
  });
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
