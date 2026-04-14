import { z } from '@todo/lib/zod';
import express from 'express';
import superjson from 'superjson';

import { log } from '~/lib/log4js';
import { createProtectHandler } from '~/middleware/express';
import { NotificationRouterSchema } from '~/schema/NotificationRouterSchema';
import { ServerSentEventsManager } from '~/worker/ServerSentEvents';

export const ServerSentEventsRouter = express.Router();

ServerSentEventsRouter.get(
  '/api/notification/subscribe',
  createProtectHandler(z.object({}), async ({ ctx }) => {
    ctx.res.setHeader('Content-Type', 'text/event-stream');
    ctx.res.setHeader('Cache-Control', 'no-cache');
    ctx.res.setHeader('Connection', 'keep-alive');

    // SSEマネージャーに、このレスポンス(ストリーム)を登録
    ServerSentEventsManager.add(
      ctx.operator.user_id,
      (notification: z.infer<typeof NotificationRouterSchema.getOutput>) => {
        log.trace('ServerSentEventsRouter#send', ctx.operator.user_id, notification);
        ctx.res.write(`data: ${superjson.stringify(notification)}\n\n`);
      },
    );
    // 接続維持のための Keep-alive
    const keepAlive = setInterval(() => {
      ctx.res.write(':keep-alive\n\n'); // コメント行として送信
    }, 30000);

    // 接続が切れたら掃除する
    ctx.res.on('close', () => {
      clearInterval(keepAlive);
      ServerSentEventsManager.remove(ctx.operator.user_id);
      ctx.res.end();
    });
  }),
);

ServerSentEventsRouter.delete(
  '/api/notification/subscribe',
  createProtectHandler(z.object({}), async ({ ctx }) => {
    ServerSentEventsManager.remove(ctx.operator.user_id);
  }),
);
