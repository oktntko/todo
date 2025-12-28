import { z } from '@todo/lib/zod';
import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { OkSchema } from '~/schema';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';
import { SpaceService } from '~/service/SpaceService';

export const space = router({
  // space.list
  list: protectedProcedure
    .input(z.void())
    .output(SpaceRouterSchema.getOutput.array())
    .query(async ({ ctx }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.listSpace({ ...ctx, prisma });
      });
    }),

  // space.get
  get: protectedProcedure
    .input(SpaceRouterSchema.getInput)
    .output(SpaceRouterSchema.getOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.getSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.create
  create: protectedProcedure
    .input(SpaceRouterSchema.createInput)
    .output(SpaceRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.createSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.update
  update: protectedProcedure
    .input(SpaceRouterSchema.updateInput)
    .output(SpaceRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.updateSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.delete
  delete: protectedProcedure
    .input(SpaceRouterSchema.deleteInput)
    .output(SpaceRouterSchema.getInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.deleteSpace({ ...ctx, prisma }, input);
      });
    }),

  // space.reorder
  reorder: protectedProcedure
    .input(SpaceRouterSchema.reorderInputList)
    .output(OkSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return SpaceService.reorderSpace({ ...ctx, prisma }, input);
      });
    }),
});
