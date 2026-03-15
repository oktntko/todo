import log4js from 'log4js';
import { cwd } from 'node:process';

import { env } from '~/lib/env';

log4js.configure({
  appenders: {
    file: {
      type: 'file',
      filename: cwd() + '/logs/application.log',
      maxLogSize: 1024 * 1024 * 10,
      backups: 5,
      compress: true,
      keepFileExt: true,
      encoding: 'utf-8',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%-5p] %m (%f{1}:%l)',
      },
    },
    stdout: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%[%-5p%]] %[%m%] (%f{1}:%l)',
      },
    },
  },
  categories: {
    default: {
      appenders: env.PROD ? ['file'] : ['stdout', 'file'],
      level: env.PROD ? 'info' : 'all',
      enableCallStack: true,
    },
    database: {
      appenders: env.PROD ? ['file'] : ['stdout', 'file'],
      level: env.PROD ? 'info' : 'all',
      enableCallStack: true,
    },
  },
});

export const log = log4js.getLogger();
