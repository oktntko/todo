import { $transaction } from '~/middleware/prisma.js';
import { protectedProcedure, router } from '~/middleware/trpc.js';
import { TagRouterSchema } from '~/schema/TagRouterSchema.js';
import { TagSchema } from '~/schema/zod/modelSchema/TagSchema.js';
import { TagService } from '~/service/TagService.js';

export const tag = router({
  // tag.list
  list: protectedProcedure
    .input(TagRouterSchema.listInput)
    .output(TagRouterSchema.listOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TagService.listTag(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // tag.get
  get: protectedProcedure
    .input(TagRouterSchema.getInput)
    .output(TagSchema)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TagService.getTag(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // tag.create
  create: protectedProcedure
    .input(TagRouterSchema.createInput)
    .output(TagSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TagService.createTag(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // tag.update
  update: protectedProcedure
    .input(TagRouterSchema.updateInput)
    .output(TagSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TagService.updateTag(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // tag.delete
  delete: protectedProcedure
    .input(TagRouterSchema.deleteInput)
    .output(TagSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TagService.deleteTag(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),
});
