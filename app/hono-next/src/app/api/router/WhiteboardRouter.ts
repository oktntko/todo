import { Hono } from 'hono';

import { requireAuth, type ProtectedEnv } from '@/app/api/middleware/auth';
import { zvJson } from '@/app/api/middleware/hono';
import { $transaction } from '@/app/api/middleware/prisma';
import { WhiteboardRouterSchema } from '@/app/api/schema';
import { WhiteboardService } from '@/app/api/service/WhiteboardService';

export const WhiteboardRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .post('/list', zvJson(WhiteboardRouterSchema.listInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await WhiteboardService.listWhiteboard({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .post('/', zvJson(WhiteboardRouterSchema.getInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await WhiteboardService.getWhiteboard({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .post('/create', zvJson(WhiteboardRouterSchema.createInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await WhiteboardService.createWhiteboard({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .post('/update', zvJson(WhiteboardRouterSchema.updateInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await WhiteboardService.updateWhiteboard({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .post('/delete', zvJson(WhiteboardRouterSchema.deleteInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await WhiteboardService.deleteWhiteboard({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .get('/applyChange', zvJson(WhiteboardRouterSchema.applyChangeInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await WhiteboardService.applyChangeWhiteboard({ prisma, operator: c.var.operator, input }),
      );
    });
  })
  .get('/reorder', zvJson(WhiteboardRouterSchema.reorderInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(
        await WhiteboardService.reorderWhiteboard({ prisma, operator: c.var.operator, input }),
      );
    });
  });
