import { hc } from 'hono/client';

import type { ApiType } from '@/api';

export const hono = hc<ApiType>('/').api;
