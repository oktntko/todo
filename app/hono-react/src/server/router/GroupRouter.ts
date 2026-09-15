import { Hono } from 'hono';

import { requireAuth, type ProtectedEnv } from '@/middleware/auth';
import { zvJson } from '@/middleware/hono';
import { $transaction } from '@/middleware/prisma';
import { GroupRouterSchema } from '@/schema';
import { GroupService } from '@/service/GroupService';

export const GroupRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .get('/list', zvJson(GroupRouterSchema.listInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await GroupService.listGroup({ prisma, operator: c.var.operator, input }));
    });
  })
  .get('/', zvJson(GroupRouterSchema.getInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await GroupService.getGroup({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/create', zvJson(GroupRouterSchema.createInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await GroupService.createGroup({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/update', zvJson(GroupRouterSchema.updateInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await GroupService.updateGroup({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/delete', zvJson(GroupRouterSchema.deleteInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await GroupService.deleteGroup({ prisma, operator: c.var.operator, input }));
    });
  })
  .get('/reorder', zvJson(GroupRouterSchema.reorderInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await GroupService.reorderGroup({ prisma, operator: c.var.operator, input }));
    });
  });
