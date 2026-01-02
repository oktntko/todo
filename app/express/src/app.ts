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
  UnexpectedErrorHandler,
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
        // xss prevention
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/require-trusted-types-for
        'require-trusted-types-for': ["'script'"],
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
app.use(UnexpectedErrorHandler);

server.on('error', (err) => {
  log.error('Error opening server', err);
});

export function listen() {
  server.listen(env.EXPRESS_PORT, () => {
    log.info(`App is running at http://localhost:${env.EXPRESS_PORT} in ${env.NODE_ENV} mode`);
  });
}
