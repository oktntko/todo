import { $transaction } from '~/middleware/prisma.js';
import { protectedProcedure, router } from '~/middleware/trpc.js';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema.js';
import { SpaceSchema } from '~/schema/zod/modelSchema/SpaceSchema.js';
import { SpaceService } from '~/service/SpaceService.js';

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
});
