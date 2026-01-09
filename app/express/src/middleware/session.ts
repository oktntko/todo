import { dayjs } from '@todo/lib/dayjs';
import * as express from 'express';
import { SessionData, Store } from 'express-session';
import superjson from 'superjson';
import { env } from '~/lib/env';
import { log } from '~/lib/log4js';
import { ExtendsPrismaClient, PrismaClient } from '~/middleware/prisma';

/**
 * https://github.com/microsoft/TypeScript-Node-Starter/blob/master/src/types/express-session-types.d.ts
 *
 * Naming this file express-session.d.ts causes imports from "express-session"
 * to reference this file and not the node_modules package.
 */
declare module 'express-session' {
  interface SessionData {
    user_id?: string | null;
    data?: {
      csrfToken?: unknown;
      // 二要素認証 設定
      setting_twofa?: {
        expires: Date;
        twofa_secret: string;
      } | null;
      // 二要素認証 ログイン
      auth_twofa?: {
        expires: Date;
        user_id: string;
      } | null;
    };
  }
}

export class SessionStore extends Store {
  async get(session_key: string, callback: (err?: unknown, session?: SessionData | null) => void) {
    try {
      const session = await getSession(session_key);
      callback(null, session);
    } catch (err) {
      callback(err);
    }
  }

  async set(session_key: string, session: SessionData, callback?: (err?: unknown) => void) {
    try {
      await setSession(session_key, session);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  async destroy(session_key: string, callback?: (err?: unknown) => void) {
    try {
      await destroySession(session_key);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}

export const SessionService = {
  getSession,
  setSession,
  destroySession,
  findUserBySession,
  regenerateSession,
};

async function findUserBySession(params: {
  prisma: PrismaClient;
  expires?: Date | null | undefined;
  user_id?: string | null;
}) {
  if (!params.expires || dayjs(params.expires).isBefore(dayjs())) {
    log.debug('Session has expired.');
    return null;
  }
  if (!params.user_id) {
    return null;
  }

  return params.prisma.user.findUnique({ where: { user_id: params.user_id } });
}

// session.get
async function getSession(session_key: string): Promise<SessionData | null> {
  log.debug('getSession', session_key);

  const foundSession = await ExtendsPrismaClient.session.findUnique({
    where: { session_key },
  });

  if (foundSession == null) {
    log.debug('Not Found Session.');
    return null;
  }

  if (foundSession.expires == null || dayjs(foundSession.expires).isBefore(dayjs())) {
    log.debug('Session has expired.');
    return null;
  }

  return {
    cookie: {
      originalMaxAge: foundSession.originalMaxAge,
      expires: foundSession.expires,
    },
    user_id: foundSession.user_id,
    data: foundSession.data ? superjson.parse<SessionData['data']>(foundSession.data) : {},
  };
}

// session.set
async function setSession(session_key: string, session: SessionData) {
  log.debug('setSession', session_key);

  return ExtendsPrismaClient.session.upsert({
    where: { session_key },
    create: {
      session_key,

      originalMaxAge: session.cookie.originalMaxAge,
      expires: session.cookie.expires,

      user_id: session.user_id,
      data: session.data ? superjson.stringify(session.data) : '{}',
    },
    update: {
      originalMaxAge: session.cookie.originalMaxAge,
      expires: session.cookie.expires,

      user_id: session.user_id,
      data: session.data ? superjson.stringify(session.data) : '{}',
    },
  });
}

// session.destroy
async function destroySession(session_key: string) {
  log.debug('destroySession', session_key);

  await ExtendsPrismaClient.session.deleteMany({
    where: { session_key },
  });

  return { ok: true };
}

// session.regenerate
async function regenerateSession(req: express.Request, res: express.Response) {
  await new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) {
        reject(err);
      } else {
        resolve({ ok: true });
      }
    });
  });

  // csrf protection
  // ＜前提＞
  // CSRFとは、ログイン中のセッションを悪用して、
  // 悪意のあるWebサイトやメールに不正なリンクから、
  // ユーザーが意図しない操作をさせる攻撃手法である。
  //
  // ＜問題＞
  // - cookie でセッションIDを管理している
  // - cookie は自動送信される
  // - 外部サイトからの不正なリクエストに、正規の cookie が送信される
  // - サーバー側では、正規の cookie が送信されてきたら認証成功と見なしてしまう
  //   => 攻撃成功
  //
  // ＜対策＞
  // １． バックエンド）認証成功時に、CSRFトークンを発行し、 cookie と session の両方に保存する。
  // ２． フロント）フロントでレスポンス cookie を読み取ってリクエストヘッダに詰める。
  //   - リクエストヘッダは cookie と異なり、自動送信されない。
  //   - 外部サイトでは cookie が読めない。
  //    => 外部サイトからの不正なリクエストには、CSRFトークンが含まれない。
  // ３． バックエンド）リクエストヘッダの CSRFトークン と session の CSRFトークン を検証して、正規の送信元であることを確認する。
  //    session の CSRFトークンと比較しているのは、攻撃者が同一オリジンで一度 token を取得できたら別セッションでも通るのを防ぐため。
  //
  // ＜その他＞
  // - CSRFは、ログイン中のセッションを悪用する攻撃なので、認証が必要ないAPIには CSRF対策をしない。
  // - 認証が必要なAPIでも、GET/HEAD/OPTIONSメソッドには CSRF対策をしない。
  //   - <a> で開けないため（ファイルダウンロードなど）
  //   - prefetch / browser restore で壊れるため
  //   - キャッシュが効かないため
  //    ↑ ただし、前提として、 GET系メソッドでは副作用を起こさないよう設計- テストしていることが必要。
  // - フロントで cookie を読み取る必要があるため、"httpOnly: false"にする必要がある。
  //
  // ＜関連箇所＞
  // - バックエンド
  //   - app/express/src/middleware/session.ts (CSRFトークン発行)
  //   - app/express/src/middleware/express.ts (CSRFトークン検証)
  //   - app/express/src/middleware/trpc.ts (CSRFトークン検証)
  // - フロント
  //   - app/vue/src/lib/axios.ts (リクエストヘッダにCSRFトークンを詰める)
  //   - app/vue/src/lib/trpc.ts (リクエストヘッダにCSRFトークンを詰める)
  //
  const token = crypto.randomUUID();

  req.session.data ??= {};
  req.session.data.csrfToken = token;
  res.cookie('csrf-token', token, {
    httpOnly: false, // フロントで読むため
    domain: env.session.SESSION_DOMAIN,
    path: env.session.SESSION_PATH,
    secure: env.PROD,
    sameSite: 'strict',
  });
}
