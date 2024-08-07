import dayjs from 'dayjs';
import { SessionData, Store } from 'express-session';
import superjson from 'superjson';
import { log } from '~/lib/log4js.js';
import { prisma } from '~/lib/prisma.js';

/**
 * https://github.com/microsoft/TypeScript-Node-Starter/blob/master/src/types/express-session-types.d.ts
 *
 * Naming this file express-session.d.ts causes imports from "express-session"
 * to reference this file and not the node_modules package.
 */
declare module 'express-session' {
  interface SessionData {
    user_id?: number | null;
    data: NonNullable<unknown>; // {}
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
      await destorySession(session_key);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}

export const SessionService = {
  getSession,
  setSession,
  destorySession,
  findUserBySession,
};

async function findUserBySession(params: {
  expires?: Date | null | undefined;
  user_id?: number | null;
}) {
  if (!params.expires || dayjs(params.expires).isBefore(dayjs())) {
    log.debug('Session has expired.');
    return null;
  }
  if (!params.user_id) {
    return null;
  }

  return prisma.user.findUnique({ where: { user_id: params.user_id } });
}

// # session.get
async function getSession(session_key: string): Promise<SessionData | null> {
  log.debug('getSession', session_key);

  const foundSession = await prisma.session.findUnique({
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

// # session.set
async function setSession(session_key: string, session: SessionData) {
  log.debug('setSession', session_key);

  return prisma.session.upsert({
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

// # session.destory
async function destorySession(session_key: string) {
  log.debug('destorySession', session_key);

  return prisma.session.delete({
    where: { session_key },
  });
}
