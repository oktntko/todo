import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { sign, verify } from 'hono/jwt';

import { env } from '~/lib/env';
import { message } from '~/lib/message';
import { ALGORITHM_TYPE, COOKIE_KEY, type AuthPayload } from '~/middleware/auth';
import { StatusCode, zvJson, type PublicEnv } from '~/middleware/hono';
import { $transaction } from '~/middleware/prisma';
import { UserRepository } from '~/repository/UserRepository';
import { AuthRouterSchema } from '~/schema';
import { AuthService } from '~/service/AuthService';

export const AuthRouter = new Hono<PublicEnv>()
  .post('/signup', zvJson(AuthRouterSchema.signupInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      const user = await AuthService.signup({ prisma, input });

      const token = await sign(
        {
          user_id: user.user_id,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
        } satisfies AuthPayload,
        env.secret.JWT_SECRET,
        ALGORITHM_TYPE,
      );

      setCookie(c, COOKIE_KEY.AUTH_TOKEN, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      });

      return c.json({ auth: true });
    });
  })
  .post('/signin', zvJson(AuthRouterSchema.signinInput), (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      const user = await AuthService.signin({ prisma, input });

      if (user.twofa_enable) {
        const token = await sign(
          {
            user_id: user.user_id,
            exp: Math.floor(Date.now() / 1000) + 60 * 5,
          } satisfies AuthPayload,
          env.secret.JWT_SECRET,
          ALGORITHM_TYPE,
        );

        setCookie(c, COOKIE_KEY.AUTH_TWOFA, token, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'Lax',
          path: '/api/auth/signinTwofa',
        });

        return c.json({ auth: false });
      } else {
        const token = await sign(
          {
            user_id: user.user_id,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
          } satisfies AuthPayload,
          env.secret.JWT_SECRET,
          ALGORITHM_TYPE,
        );

        setCookie(c, COOKIE_KEY.AUTH_TOKEN, token, {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'Lax',
          path: '/',
        });

        return c.json({ auth: true });
      }
    });
  })
  .post('/signinTwofa', zvJson(AuthRouterSchema.signinTwofaInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      const auth_twofa = getCookie(c, COOKIE_KEY.AUTH_TWOFA);

      if (!auth_twofa) {
        throw new HTTPException(StatusCode.UNAUTHORIZED, { message: message.error.UNAUTHORIZED });
      }

      const payload = await verify(auth_twofa, env.secret.JWT_SECRET, ALGORITHM_TYPE);
      const exp = payload['exp'];
      const user_id = payload['user_id'];

      if (typeof exp !== 'number' || typeof user_id !== 'string') {
        throw new HTTPException(StatusCode.UNAUTHORIZED, { message: message.error.UNAUTHORIZED });
      }

      const user = await AuthService.signinTwofa({
        prisma,
        input: { ...input, exp, user_id },
      });

      deleteCookie(c, COOKIE_KEY.AUTH_TWOFA, { path: '/api/auth/signinTwofa' });

      const token = await sign(
        {
          user_id: user.user_id,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
        } satisfies AuthPayload,
        env.secret.JWT_SECRET,
        ALGORITHM_TYPE,
      );

      setCookie(c, COOKIE_KEY.AUTH_TOKEN, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      });

      return c.json({ auth: true });
    });
  })
  .get('/', async (c) => {
    const token = getCookie(c, COOKIE_KEY.AUTH_TOKEN);

    if (!token) {
      return c.json({ auth: false }, StatusCode.OK);
    }

    const payload = await verify(token, env.secret.JWT_SECRET, ALGORITHM_TYPE);
    const user_id = payload['user_id'];

    if (typeof user_id !== 'string') {
      return c.json({ auth: false }, StatusCode.OK);
    }

    const operator = await UserRepository.findUniqueUser(c.var.prisma, {
      where: {
        user_id,
      },
    });

    if (operator == null) {
      return c.json({ auth: false }, StatusCode.OK);
    }

    return c.json({ auth: true }, StatusCode.OK);
  })
  .post('/delete', (c) => {
    deleteCookie(c, COOKIE_KEY.AUTH_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
    });

    return c.json({ ok: true });
  });
