import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

import { api } from '@/api';
import { env } from '@/lib/env';
import { hono } from '@/middleware/hono';

hono.route('/', api).use('*', serveStatic({ root: './dist/client' }));

serve({
  fetch: hono.fetch,
  port: env.EXPRESS_PORT,
});
