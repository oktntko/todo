import pino from 'pino';

import { env } from '~/lib/env';

export const log = pino({
  level: env.PROD ? 'info' : 'trace',
  transport: {
    targets: [
      {
        target: 'pino/file',
        options: {
          destination: 1, // stdout
        },
        level: env.PROD ? 'info' : 'trace',
      },
      env.PROD
        ? undefined
        : {
            target: 'pino/file',
            options: {
              destination: './logs/application.log',
              mkdir: true,
            },
            level: env.PROD ? 'info' : 'trace',
          },
    ].filter((x): x is NonNullable<typeof x> => x != null),
  },
});
