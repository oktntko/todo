import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { logger } from 'hono/logger';

import { api } from './api';
import { env } from './lib/env';

const server = new Hono().use(logger()).use(compress());
server.route('/', api);

server.use('*', serveStatic({ root: './dist/client' }));

serve({
  fetch: server.fetch,
  port: env.EXPRESS_PORT,
});
