import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { TodoOutputSchema, TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { TodoService } from '~/service/TodoService';

export const todo = router({
  // todo.list
  list: protectedProcedure
    .input(TodoRouterSchema.listInput)
    .output(TodoOutputSchema.array())
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.listTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.search
  search: protectedProcedure
    .input(TodoRouterSchema.searchInput)
    .output(TodoRouterSchema.searchOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.searchTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.get
  get: protectedProcedure
    .input(TodoRouterSchema.getInput)
    .output(TodoOutputSchema)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.getTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.upsert
  upsert: protectedProcedure
    .input(TodoRouterSchema.upsertInput)
    .output(TodoOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.upsertTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.create
  create: protectedProcedure
    .input(TodoRouterSchema.createInput)
    .output(TodoOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.createTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.update
  update: protectedProcedure
    .input(TodoRouterSchema.updateInput)
    .output(TodoOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.updateTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.updateMany
  updateMany: protectedProcedure
    .input(TodoRouterSchema.updateManyInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.updateManyTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.delete
  delete: protectedProcedure
    .input(TodoRouterSchema.getInput)
    .output(TodoOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.deleteTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.deleteMany
  deleteMany: protectedProcedure
    .input(TodoRouterSchema.deleteManyInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.deleteManyTodo({ ...ctx, prisma }, input);
      });
    }),
});
