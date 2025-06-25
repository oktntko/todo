import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { TodoOutputSchema, TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { TodoSchema } from '~/schema/zod/modelSchema/TodoSchema';
import { TodoService } from '~/service/TodoService';

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

  // todo.search
  search: protectedProcedure
    .input(TodoRouterSchema.searchInput)
    .output(TodoRouterSchema.searchOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.searchTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
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

  // todo.create
  create: protectedProcedure
    .input(TodoRouterSchema.createInput)
    .output(TodoOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.createTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // todo.update
  update: protectedProcedure
    .input(TodoRouterSchema.updateInput)
    .output(TodoOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.updateTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // todo.updateMany
  updateMany: protectedProcedure
    .input(TodoRouterSchema.updateManyInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.updateManyTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // todo.delete
  delete: protectedProcedure
    .input(TodoRouterSchema.getInput)
    .output(TodoSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.deleteTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),

  // todo.deleteMany
  deleteMany: protectedProcedure
    .input(TodoRouterSchema.deleteManyInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.deleteManyTodo(ctx.req.reqid, prisma, ctx.operator_id, input);
      });
    }),
});
