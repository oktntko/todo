import { Hono } from 'hono';

import { requireAuth, type ProtectedEnv } from '@/middleware/auth';
import { zvJson } from '@/middleware/hono';
import { $transaction } from '@/middleware/prisma';
import { AichatRouterSchema } from '@/schema';
import { AichatService } from '@/service/AichatService';

export const AichatRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .get('/list', zvJson(AichatRouterSchema.listInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await AichatService.listAichat({ prisma, operator: c.var.operator, input }));
    });
  })
  .get('/', zvJson(AichatRouterSchema.getInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await AichatService.getAichat({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/create', zvJson(AichatRouterSchema.createInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await AichatService.createAichat({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/update', zvJson(AichatRouterSchema.updateInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await AichatService.updateAichat({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/delete', zvJson(AichatRouterSchema.deleteInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await AichatService.deleteAichat({ prisma, operator: c.var.operator, input }));
    });
  })
  .get('/listMessage', zvJson(AichatRouterSchema.listMessageInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await AichatService.listAichatMessage({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .post('/postMessage', zvJson(AichatRouterSchema.postMessageInput), async (c) => {
    return $transaction(
      c.var.prisma,
      async (prisma) => {
        const input = c.req.valid('json');
        return c.json(
          await AichatService.postAichatMessage({ prisma, operator: c.var.operator, input }),
        );
      },
      { maxWait: 5000, timeout: 30000 },
    );
  });
