import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

import { env } from '@/lib/env';
import { hono } from '@/middleware/hono';
import { api } from '@/router/_api';

hono.route('/', api).use('*', serveStatic({ root: './dist/client' }));

serve({
  fetch: hono.fetch,
  port: env.EXPRESS_PORT,
});
