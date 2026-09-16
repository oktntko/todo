import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

import { requireAuth, type ProtectedEnv } from '@/middleware/auth';
import { zvJson } from '@/middleware/hono';
import { $transaction } from '@/middleware/prisma';
import { NotificationRouterSchema } from '@/schema';
import { NotificationService } from '@/service/NotificationService';
import { ServerSentEventsManager } from '@/worker/ServerSentEvents';

export const NotificationRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .post('/list', async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      return c.json(
        await NotificationService.listNotification({ prisma, operator: c.var.operator }),
      );
    });
  })
  .post('/addTodo', zvJson(NotificationRouterSchema.addNotificationTodoInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await NotificationService.addNotificationTodo({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .post('/read', zvJson(NotificationRouterSchema.getInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await NotificationService.readNotification({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .post('/removeTodo', zvJson(NotificationRouterSchema.removeInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await NotificationService.removeNotificationTodo({
          prisma,
          operator: c.var.operator,
          input,
        }),
      );
    });
  })
  .get('/subscribe', async (c) => {
    return streamSSE(c, async (stream) => {
      const user_id = c.var.operator.user_id;

      ServerSentEventsManager.add(user_id, async (notification) => {
        console.debug({ user_id }, 'ServerSentEventsRouter#send ', notification);

        await stream.writeSSE({
          data: JSON.stringify(notification),
        });
      });

      const keepAlive = setInterval(async () => {
        await stream.write(':keep-alive\n\n');
      }, 30000);

      stream.onAbort(() => {
        clearInterval(keepAlive);
        ServerSentEventsManager.remove(user_id);
        console.debug({ user_id }, 'SSE connection closed and cleaned up');
      });

      while (!stream.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    });
  })
  .delete('/subscribe', async (c) => {
    const user_id = c.var.operator.user_id;
    ServerSentEventsManager.remove(user_id);
    return c.json({ ok: true });
  });
