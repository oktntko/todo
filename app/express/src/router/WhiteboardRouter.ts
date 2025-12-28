import { z } from '@todo/lib/zod';
import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { OkSchema } from '~/schema';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';
import { WhiteboardService } from '~/service/WhiteboardService';

export const whiteboard = router({
  // whiteboard.list
  list: protectedProcedure
    .input(z.void())
    .output(WhiteboardRouterSchema.getOutput.array())
    .query(async ({ ctx }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return WhiteboardService.listWhiteboard({ ...ctx, prisma });
      });
    }),

  // whiteboard.get
  get: protectedProcedure
    .input(WhiteboardRouterSchema.getInput)
    .output(WhiteboardRouterSchema.getOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return WhiteboardService.getWhiteboard({ ...ctx, prisma }, input);
      });
    }),

  // whiteboard.create
  create: protectedProcedure
    .input(WhiteboardRouterSchema.createInput)
    .output(WhiteboardRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return WhiteboardService.createWhiteboard({ ...ctx, prisma }, input);
      });
    }),

  // whiteboard.update
  update: protectedProcedure
    .input(WhiteboardRouterSchema.updateInput)
    .output(WhiteboardRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return WhiteboardService.updateWhiteboard({ ...ctx, prisma }, input);
      });
    }),

  // whiteboard.upsert
  upsert: protectedProcedure
    .input(WhiteboardRouterSchema.upsertInput)
    .output(WhiteboardRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return WhiteboardService.upsertWhiteboard({ ...ctx, prisma }, input);
      });
    }),

  // whiteboard.delete
  delete: protectedProcedure
    .input(WhiteboardRouterSchema.deleteInput)
    .output(WhiteboardRouterSchema.getInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return WhiteboardService.deleteWhiteboard({ ...ctx, prisma }, input);
      });
    }),

  // whiteboard.reorder
  reorder: protectedProcedure
    .input(WhiteboardRouterSchema.reorderInputList)
    .output(OkSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return WhiteboardService.reorderWhiteboard({ ...ctx, prisma }, input);
      });
    }),
});
