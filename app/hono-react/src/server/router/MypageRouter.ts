import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import { sign, verify } from 'hono/jwt';

import { env } from '@/lib/env';
import {
  ALGORITHM_TYPE,
  COOKIE_KEY,
  requireAuth,
  type ProtectedEnv,
  type TwofaSecretPayload,
} from '@/middleware/auth';
import { StatusCode, zvJson } from '@/middleware/hono';
import { $transaction } from '@/middleware/prisma';
import { MypageRouterSchema } from '@/schema';
import { MypageService } from '@/service/MypageService';

export const MypageRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .get('/', async (c) => {
    const user = c.var.operator;
    return c.json(MypageRouterSchema.getOutput.parse(user));
  })
  .post('/delete', async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const _ = await MypageService.deleteMypage({ prisma, operator: c.var.operator });

      deleteCookie(c, COOKIE_KEY.AUTH_TOKEN, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      });

      return c.json({ ok: true });
    });
  })
  .post('/patchPassword', zvJson(MypageRouterSchema.patchPasswordInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      const user = await MypageService.patchPassword({ prisma, operator: c.var.operator, input });
      return c.json(MypageRouterSchema.getOutput.parse(user));
    });
  })
  .post('/patchProfile', zvJson(MypageRouterSchema.patchProfileInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      const user = await MypageService.patchProfile({ prisma, operator: c.var.operator, input });
      return c.json(MypageRouterSchema.getOutput.parse(user));
    });
  })
  .post('/generateSecret', async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const data = await MypageService.generateSecret({ prisma, operator: c.var.operator });

      const token = await sign(
        {
          twofa_secret: data.twofa_secret,
          exp: Math.floor(Date.now() / 1000) + 60 * 5,
        } satisfies TwofaSecretPayload,
        env.secret.JWT_SECRET,
        ALGORITHM_TYPE,
      );

      // set cookie
      setCookie(c, COOKIE_KEY.MYPAGE_TWOFA_SECRET, token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/api/mypage',
      });

      return c.json({ dataurl: data.dataurl });
    });
  })
  .post('/enableSecret', zvJson(MypageRouterSchema.enableSecretInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');

      // get cookie
      const mypage_twofa_secret = getCookie(c, COOKIE_KEY.MYPAGE_TWOFA_SECRET);
      if (!mypage_twofa_secret) {
        // mypage_twofa_secret がないのは generateSecret が実行されていない場合（またはセッションがリセットされた場合）。
        // 通常の操作では起こりづらいため、有効期限がきれていることだけ伝える。
        throw new HTTPException(StatusCode.BAD_REQUEST, {
          message:
            'Your two-factor authentication setup has expired. Please start the setup process again.',
        });
      }

      const payload = await verify(mypage_twofa_secret, env.secret.JWT_SECRET, ALGORITHM_TYPE);
      const exp = payload['exp'];
      const twofa_secret = payload['twofa_secret'];
      if (typeof exp !== 'number' || typeof twofa_secret !== 'string') {
        throw new HTTPException(StatusCode.BAD_REQUEST, {
          message:
            'Your two-factor authentication setup has expired. Please start the setup process again.',
        });
      }

      const _ = await MypageService.enableSecret({
        prisma,
        operator: c.var.operator,
        input: {
          ...input,
          twofa_secret,
        },
      });

      deleteCookie(c, COOKIE_KEY.MYPAGE_TWOFA_SECRET, { path: '/api/mypage' });

      return c.json({ ok: true });
    });
  })
  .post('/disableSecret', async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const _ = await MypageService.disableSecret({ prisma, operator: c.var.operator });

      deleteCookie(c, COOKIE_KEY.MYPAGE_TWOFA_SECRET, { path: '/api/mypage' });

      return c.json({ ok: true });
    });
  });
