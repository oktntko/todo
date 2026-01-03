import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { createServer } from 'node:http';
import { env } from '~/lib/env';
import { log } from '~/lib/log4js';
import {
  ErrorHandler,
  InjectRequestIdHandler,
  LogHandler,
  NotFoundHandler,
  UnhandledErrorHandler,
} from '~/middleware/express';
import { SessionStore } from '~/middleware/session';
import { createExpressMiddleware } from '~/middleware/trpc';
import { ExpressRouter, TrpcRouter } from '~/router/_router';

export const app = express();
const server = createServer(app);

// Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // nginxでリバースプロキシするときは効果なし
        // xss prevention
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/require-trusted-types-for
        'require-trusted-types-for': ["'script'"],

        // ● Clickjacking
        // Clickjacking  ： iframe を使って「見えない / 偽装された正規サイト」をクリックさせる攻撃。 「iframe」前提
        // iframe による埋め込み禁止
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
        // frame-ancestors 'self' でも安全ではあるが、同一オリジンが絶対安全とする場合のみ。
        // /public などの軽いページを悪用されたり、 XSS で iframe を埋め込まれる可能性がある。

        // ● UI Redressing
        // UI Redressing ： ユーザーが見ているUIと、実際に操作している対象がズレている攻撃全般。 「UIの誤誘導」
        // Clickjacking の上位概念
        // ＜対策＞
        // ① 重要操作は「1クリックで完結」しない。確認などの操作を挟む。
        // 例）削除、送金、権限変更、外部連携など
        // ② 危険操作は「視覚的に孤立」させて、オーバーレイで誤誘導させにくくする。
        //
        // ③ 重要操作には「抽象的・汎用的な文言」を使わず、「具体的な内容」を示す。
        // 例）OK、実行、確定→削除する、退会する、連携を解除する
        // ④ 重要操作にはユーザー入力を要求する。（ｘｘｘと入力してくださいなど）
        //
        // ⑤ サーバ側でパラメータを必須にする、再認証を必要とするなど、フロントに頼らない。
        'frame-ancestors': ["'none'"],
      },
    },
  }),
);

app.use(InjectRequestIdHandler);
app.use(LogHandler);

app.set('trust proxy', 1); // trust first proxy

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const SessionMiddleware = session({
  secret: env.session.SESSION_SECRET,
  name: env.session.SESSION_NAME,
  store: new SessionStore(),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 /*ms*/,
    httpOnly: true,
    domain: env.session.SESSION_DOMAIN,
    path: env.session.SESSION_PATH,
    secure: env.PROD,
    sameSite: 'strict',
  },
  resave: false,
  saveUninitialized: false,
});
app.use(SessionMiddleware);

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: TrpcRouter,
    onError(opts) {
      if (
        [
          'PARSE_ERROR',

          'INTERNAL_SERVER_ERROR',
          'NOT_IMPLEMENTED',
          'BAD_GATEWAY',
          'SERVICE_UNAVAILABLE',
          'GATEWAY_TIMEOUT',

          'PRECONDITION_FAILED',
          'UNSUPPORTED_MEDIA_TYPE',
          'UNPROCESSABLE_CONTENT',
          'TOO_MANY_REQUESTS',
          'CLIENT_CLOSED_REQUEST',
        ].some((x) => x === opts.error.code)
      ) {
        log.error(opts.error.code, opts.error);
      } else {
        log.warn(opts.error.code, opts.error);
      }
    },
  }),
);
app.use(...ExpressRouter);

app.use(ErrorHandler);
app.use(NotFoundHandler);
app.use(UnhandledErrorHandler);

server.on('error', (err) => {
  log.error('Error opening server', err);
});

export function listen() {
  server.listen(env.EXPRESS_PORT, () => {
    log.info(`App is running at http://localhost:${env.EXPRESS_PORT} in ${env.NODE_ENV} mode`);
  });
}
