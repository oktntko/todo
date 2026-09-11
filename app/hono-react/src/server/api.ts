import { Hono } from 'hono';

import { AuthRouter } from '@/router/AuthRouter';

export const api = new Hono().basePath('/api').route('/auth', AuthRouter);

export type ApiType = typeof api;
