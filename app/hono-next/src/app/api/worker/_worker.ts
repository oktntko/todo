import { env } from '@/app/api/lib/env';

export const REDIS_CONNECTION = {
  host: env.CACHE_HOST,
  port: env.CACHE_PORT,
};

export const WORKER_CONCURRENCY = 5;
