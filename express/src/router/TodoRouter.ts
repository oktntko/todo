import { $transaction } from '~/middleware/prisma.js';
import { protectedProcedure, router } from '~/middleware/trpc.js';
import { TodoOutputSchema, TodoRouterSchema } from '~/schema/TodoRouterSchema.js';
import { TodoSchema } from '~/schema/zod/modelSchema/TodoSchema.js';
import { TodoService } from '~/service/TodoService.js';

export const todo = router({
  // todo.list
  list: protectedProcedure
    .input(TodoRouterSchema.listInput)
    .output(TodoRouterSchema.listOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.listTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // todo.get
  get: protectedProcedure
    .input(TodoRouterSchema.getInput)
    .output(TodoOutputSchema)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.getTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // todo.upsert
  upsert: protectedProcedure
    .input(TodoRouterSchema.upsertInput)
    .output(TodoOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.upsertTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // todo.delete
  delete: protectedProcedure
    .input(TodoRouterSchema.deleteInput)
    .output(TodoSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.deleteTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),
});
