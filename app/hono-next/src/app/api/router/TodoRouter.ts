import { Hono } from 'hono';

import { requireAuth, type ProtectedEnv } from '@/app/api/middleware/auth';
import { zvJson, zvParam } from '@/app/api/middleware/hono';
import { $transaction } from '@/app/api/middleware/prisma';
import { TodoRouterSchema } from '@/app/api/schema';
import { TodoService } from '@/app/api/service/TodoService';

export const TodoRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .post('/list', zvJson(TodoRouterSchema.listInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await TodoService.listTodo({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/search', zvJson(TodoRouterSchema.searchInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await TodoService.searchTodo({ prisma, operator: c.var.operator, input }));
    });
  })
  .get('/:todo_id', zvParam(TodoRouterSchema.getInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('param');
      return c.json(await TodoService.getTodo({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/create', zvJson(TodoRouterSchema.createInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await TodoService.createTodo({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/update', zvJson(TodoRouterSchema.updateInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await TodoService.updateTodo({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/applyChange', zvJson(TodoRouterSchema.applyChangeInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await TodoService.applyChangeTodo({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/updateMany', zvJson(TodoRouterSchema.updateManyInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await TodoService.updateManyTodo({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/delete', zvJson(TodoRouterSchema.deleteInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await TodoService.deleteTodo({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/deleteMany', zvJson(TodoRouterSchema.deleteManyInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('json');
      return c.json(await TodoService.deleteManyTodo({ prisma, operator: c.var.operator, input }));
    });
  });
