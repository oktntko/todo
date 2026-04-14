import { z } from '@todo/lib/zod';

import { $transaction } from '~/middleware/prisma';
import { protectedProcedure, router } from '~/middleware/trpc';
import { OkSchema } from '~/schema';
import { NotificationRouterSchema } from '~/schema/NotificationRouterSchema';
import { NotificationService } from '~/service/NotificationService';

export const notification = router({
  // notification.list
  list: protectedProcedure
    .input(z.void())
    .output(NotificationRouterSchema.listOutput)
    .query(async ({ ctx }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return NotificationService.listNotification({ ...ctx, prisma });
      });
    }),

  // notification.addTodo
  addTodo: protectedProcedure
    .input(NotificationRouterSchema.addNotificationTodoInput)
    .output(NotificationRouterSchema.getOutput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return NotificationService.addNotificationTodo({ ...ctx, prisma }, input);
      });
    }),

  // notification.read
  read: protectedProcedure
    .input(NotificationRouterSchema.getInput)
    .output(OkSchema)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return NotificationService.readNotification({ ...ctx, prisma }, input);
      });
    }),

  // notification.removeTodo
  removeTodo: protectedProcedure
    .input(NotificationRouterSchema.removeInput)
    .output(NotificationRouterSchema.getInput)
    .mutation(async ({ ctx, input }) => {
      return $transaction(ctx.prisma, async (prisma) => {
        return NotificationService.removeNotificationTodo({ ...ctx, prisma }, input);
      });
    }),
});
