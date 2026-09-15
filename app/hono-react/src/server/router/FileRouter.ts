import { Hono } from 'hono';

import { type ProtectedEnv, requireAuth } from '@/middleware/auth';
import { zvForm, zvParam, zvQuery } from '@/middleware/hono';
import { $transaction } from '@/middleware/prisma';
import { FileRouterSchema } from '@/schema';
import { FileService } from '@/service/FileService';

export const FileRouter = new Hono<ProtectedEnv>()
  .use(requireAuth)
  .get('/download/single/:file_id', zvParam(FileRouterSchema.getInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('param');
      const { filedata, buffer } = await FileService.readFile({
        prisma,
        operator: c.var.operator,
        input,
      });

      c.header(
        'Content-Disposition',
        `attachment; filename=${encodeURIComponent(filedata.filename)}`,
      );

      return c.body(buffer);
    });
  })
  .get('/download/many', zvQuery(FileRouterSchema.getManyInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('query');
      const { filedata, buffer } = await FileService.readManyFile({
        prisma,
        operator: c.var.operator,
        input,
      });

      c.header(
        'Content-Disposition',
        `attachment; filename=${encodeURIComponent(filedata.filename)}`,
      );

      return c.body(buffer);
    });
  })
  .post('/upload/single', zvForm(FileRouterSchema.createInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('form');
      return c.json(await FileService.createFile({ prisma, operator: c.var.operator, input }));
    });
  })
  .post('/upload/many', zvForm(FileRouterSchema.createManyInput), async (c) => {
    return $transaction(c.var.prisma, async (prisma) => {
      const input = c.req.valid('form');
      return c.json(await FileService.createManyFile({ prisma, operator: c.var.operator, input }));
    });
  });
