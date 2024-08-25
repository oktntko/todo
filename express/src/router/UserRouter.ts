import { $transaction } from '~/middleware/prisma.js';
import { protectedProcedure, router } from '~/middleware/trpc.js';
import { UserRouterSchema } from '~/schema/UserRouterSchema.js';
import { UserSchema } from '~/schema/zod/modelSchema/UserSchema.js';
import { UserService } from '~/service/UserService.js';

export const user = router({
  // user.list
  list: protectedProcedure
    .input(UserRouterSchema.listInput)
    .output(UserRouterSchema.listOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return UserService.listUser(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // user.get
  get: protectedProcedure
    .input(UserRouterSchema.getInput)
    .output(UserSchema)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return UserService.getUser(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // user.create
  create: protectedProcedure
    .input(UserRouterSchema.createInput)
    .output(UserSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return UserService.createUser(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // user.update
  update: protectedProcedure
    .input(UserRouterSchema.updateInput)
    .output(UserSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return UserService.updateUser(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // user.delete
  delete: protectedProcedure
    .input(UserRouterSchema.deleteInput)
    .output(UserSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return UserService.deleteUser(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),
});
