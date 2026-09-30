import { Hono } from 'hono';

import { requireAuth, type ProtectedEnv } from '~/middleware/auth';
import { zvJson } from '~/middleware/hono';
import { $transaction } from '~/middleware/prisma';
import { SpaceRouterSchema } from '~/schema';
import { SpaceService } from '~/service/SpaceService';

export const SpaceRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .post('/list', async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      return c.json(await SpaceService.listSpace({ prisma, operator: c.var.operator }));
    });
  })
  .post('/', zvJson(SpaceRouterSchema.getInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await SpaceService.getSpace({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/create', zvJson(SpaceRouterSchema.createInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await SpaceService.createSpace({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/update', zvJson(SpaceRouterSchema.updateInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await SpaceService.updateSpace({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/delete', zvJson(SpaceRouterSchema.deleteInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await SpaceService.deleteSpace({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('enableAichat', zvJson(SpaceRouterSchema.enableAichatInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await SpaceService.enableAichat({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('disableAichat', zvJson(SpaceRouterSchema.deleteInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await SpaceService.disableAichat({ prisma, operator: c.var.operator, input }));
    });
  });
