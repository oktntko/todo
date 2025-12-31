import { z } from '@todo/lib/zod';
import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { OkSchema } from '~/schema';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';
import { GroupService } from '~/service/GroupService';

export const group = router({
  // group.list
  list: protectedProcedure
    .input(z.void())
    .output(GroupRouterSchema.getOutput.array())
    .query(async ({ ctx }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return GroupService.listGroup({ ...ctx, prisma });
      });
    }),

  // group.get
  get: protectedProcedure
    .input(GroupRouterSchema.getInput)
    .output(GroupRouterSchema.getOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return GroupService.getGroup({ ...ctx, prisma }, input);
      });
    }),

  // group.create
  create: protectedProcedure
    .input(GroupRouterSchema.createInput)
    .output(GroupRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return GroupService.createGroup({ ...ctx, prisma }, input);
      });
    }),

  // group.update
  update: protectedProcedure
    .input(GroupRouterSchema.updateInput)
    .output(GroupRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return GroupService.updateGroup({ ...ctx, prisma }, input);
      });
    }),

  // group.delete
  delete: protectedProcedure
    .input(GroupRouterSchema.deleteInput)
    .output(GroupRouterSchema.getInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return GroupService.deleteGroup({ ...ctx, prisma }, input);
      });
    }),

  // group.reorder
  reorder: protectedProcedure
    .input(GroupRouterSchema.reorderInputList)
    .output(OkSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return GroupService.reorderGroup({ ...ctx, prisma }, input);
      });
    }),
});
