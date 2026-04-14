export const env = {
  APP_NAME: process.env.APP_NAME,
  get NODE_ENV() {
    if (process.env.NODE_ENV === 'production') {
      return 'production';
    } else {
      return 'development';
    }
  },
  get PROD() {
    return process.env.NODE_ENV === 'production';
  },
  EXPRESS_PORT: Number(process.env.EXPRESS_PORT!),
  CACHE_HOST: process.env.CACHE_HOST!,
  CACHE_PORT: Number(process.env.CACHE_PORT!),
  session: {
    SESSION_SECRET: process.env.SESSION_SECRET!,
    SESSION_NAME: process.env.SESSION_NAME,
    SESSION_DOMAIN: process.env.SESSION_DOMAIN,
    SESSION_PATH: process.env.SESSION_PATH,
  },
  secret: {
    SECRET_KEY: process.env.SECRET_KEY!,
  },
} as const;
