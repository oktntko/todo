import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { OkSchema } from '~/schema';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { TodoService } from '~/service/TodoService';

export const todo = router({
  // todo.list
  list: protectedProcedure
    .input(TodoRouterSchema.listInput)
    .output(TodoRouterSchema.getOutput.array())
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
    .output(TodoRouterSchema.getOutput)
    .query(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.getTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.upsert
  upsert: protectedProcedure
    .input(TodoRouterSchema.upsertInput)
    .output(TodoRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.upsertTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.create
  create: protectedProcedure
    .input(TodoRouterSchema.createInput)
    .output(TodoRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.createTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.update
  update: protectedProcedure
    .input(TodoRouterSchema.updateInput)
    .output(TodoRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.updateTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.updateMany
  updateMany: protectedProcedure
    .input(TodoRouterSchema.updateManyInput)
    .output(OkSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.updateManyTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.delete
  delete: protectedProcedure
    .input(TodoRouterSchema.getInput)
    .output(TodoRouterSchema.getInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.deleteTodo({ ...ctx, prisma }, input);
      });
    }),

  // todo.deleteMany
  deleteMany: protectedProcedure
    .input(TodoRouterSchema.deleteManyInput)
    .output(OkSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return TodoService.deleteManyTodo({ ...ctx, prisma }, input);
      });
    }),
});
