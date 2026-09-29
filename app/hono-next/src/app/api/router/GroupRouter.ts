import { Hono } from 'hono';

import { requireAuth, type ProtectedEnv } from '@/app/api/middleware/auth';
import { zvJson } from '@/app/api/middleware/hono';
import { $transaction } from '@/app/api/middleware/prisma';
import { GroupService } from '@/app/api/service/GroupService';
import { GroupRouterSchema } from '@/schema';

export const GroupRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .post('/list', zvJson(GroupRouterSchema.listInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await GroupService.listGroup({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/', zvJson(GroupRouterSchema.getInput), async (c) => {
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
  .post('/reorder', zvJson(GroupRouterSchema.reorderInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await GroupService.reorderGroup({ prisma, operator: c.var.operator, input }));
    });
  });
