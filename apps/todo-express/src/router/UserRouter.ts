import { $transaction } from '-prisma/client';
import { UserSchema } from '-prisma/schema';
import { protectedProcedure, router } from '~/middleware/trpc';
import { UserRouterSchema } from '~/schema/UserRouterSchema';
import { UserService } from '~/service/UserService';

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
