import { $transaction } from '@todo/prisma/client';
import { SpaceSchema } from '@todo/prisma/schema';
import { protectedProcedure, router } from '~/middleware/trpc';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';
import { SpaceService } from '~/service/SpaceService';

export const space = router({
  // space.list
  list: protectedProcedure
    .input(SpaceRouterSchema.listInput)
    .output(SpaceRouterSchema.listOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.listSpace(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // space.get
  get: protectedProcedure
    .input(SpaceRouterSchema.getInput)
    .output(SpaceSchema)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.getSpace(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // space.create
  create: protectedProcedure
    .input(SpaceRouterSchema.createInput)
    .output(SpaceSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.createSpace(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // space.update
  update: protectedProcedure
    .input(SpaceRouterSchema.updateInput)
    .output(SpaceSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.updateSpace(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // space.delete
  delete: protectedProcedure
    .input(SpaceRouterSchema.deleteInput)
    .output(SpaceSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.deleteSpace(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // space.reorder
  reorder: protectedProcedure
    .input(SpaceRouterSchema.reorderInputList)
    .output(SpaceSchema.array())
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.reorderSpace(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),
});
