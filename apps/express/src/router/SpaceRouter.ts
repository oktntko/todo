import { SpaceSchema } from '@todo/prisma/schema';
import { $transaction } from '~/middleware/prisma';
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
        return SpaceService.listSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.get
  get: protectedProcedure
    .input(SpaceRouterSchema.getInput)
    .output(SpaceSchema)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.getSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.create
  create: protectedProcedure
    .input(SpaceRouterSchema.createInput)
    .output(SpaceSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.createSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.update
  update: protectedProcedure
    .input(SpaceRouterSchema.updateInput)
    .output(SpaceSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.updateSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.delete
  delete: protectedProcedure
    .input(SpaceRouterSchema.deleteInput)
    .output(SpaceSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.deleteSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.reorder
  reorder: protectedProcedure
    .input(SpaceRouterSchema.reorderInputList)
    .output(SpaceSchema.array())
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.reorderSpace({ ...ctx, prisma }, input);
      });
    }),
});
