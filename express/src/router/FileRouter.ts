import express from 'express';
import multer from 'multer';
import { z } from '~/lib/zod.js';
import { createProtecteHandler } from '~/middleware/express.js';
import { $transaction } from '~/middleware/prisma.js';
import { protectedProcedure, router } from '~/middleware/trpc.js';
import { FileRouterSchema } from '~/schema/FileRouterSchema.js';
import { FileService } from '~/service/FileService.js';

////////////////////////////////////////////////
// express
////////////////////////////////////////////////
const upload = multer({
  limits: {
    fieldNameSize: 100, // 100 bytes
    fieldSize: 1048576, // 1MB
    fileSize: 10485760, // 10MB
  },
});

export const FileRouter = express.Router();

FileRouter.get(
  '/api/file/download/single/:file_id',
  createProtecteHandler(z.object({ params: FileRouterSchema.getInput }), ({ ctx, input }) => {
    return $transaction(ctx.prisma, async (prisma) => {
      const { filedata, buffer } = await FileService.readFile(
        ctx.req.reqid,
        prisma,
        ctx.operator_id,
        input.params,
      );

      ctx.res.set({
        'Content-Disposition': `attachment; filename=${encodeURIComponent(filedata.filename)}`,
      });
      return ctx.res.send(buffer);
    });
  }),
);

FileRouter.get(
  '/api/file/download/many',
  createProtecteHandler(z.object({ query: FileRouterSchema.getManyInput }), ({ ctx, input }) => {
    return $transaction(ctx.prisma, async (prisma) => {
      const { filedata, buffer } = await FileService.readManyFile(
        ctx.req.reqid,
        prisma,
        ctx.operator_id,
        input.query,
      );

      ctx.res.set({
        'Content-Disposition': `attachment; filename=${encodeURIComponent(filedata.filename)}`,
      });
      return ctx.res.send(buffer);
    });
  }),
);

FileRouter.post(
  '/api/file/upload/single',
  upload.single('file'),
  createProtecteHandler(FileRouterSchema.createInput, ({ ctx, input }) => {
    return $transaction(ctx.prisma, async (prisma) => {
      const json = await FileService.createFile(ctx.req.reqid, prisma, ctx.operator_id, input);

      return ctx.res.json(json);
    });
  }),
);

FileRouter.post(
  '/api/file/upload/many',
  upload.array('files'),
  createProtecteHandler(FileRouterSchema.createManyInput, ({ ctx, input }) => {
    return $transaction(ctx.prisma, async (prisma) => {
      const json = await FileService.createManyFile(ctx.req.reqid, prisma, ctx.operator_id, input);

      return ctx.res.json(json);
    });
  }),
);

////////////////////////////////////////////////
// trpc
////////////////////////////////////////////////
export const file = router({
  search: protectedProcedure
    .input(FileRouterSchema.searchInput)
    .output(FileRouterSchema.searchOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return FileService.searchFile(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  delete: protectedProcedure
    .input(FileRouterSchema.deleteInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return FileService.deleteFile(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  deleteMany: protectedProcedure
    .input(FileRouterSchema.deleteInput.array())
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return FileService.deleteManyFile(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),
});
