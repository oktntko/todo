import { z } from '@todo/lib/zod';
import { NotificationSchema, NotificationTodoSchema } from '@todo/prisma/schema';

const getOutput = z.union([
  NotificationSchema.extend({
    type: z.literal('general'),
  }),
  NotificationTodoSchema.extend({
    type: z.literal('todo'),
  }),
]);
const listOutput = getOutput.array();

const getInput = NotificationSchema.pick({
  notification_id: true,
});
const removeInput = getInput;

const addNotificationTodoInput = NotificationTodoSchema.pick({
  todo_id: true,
}).extend({
  delay: z.number().min(0),
});

export const NotificationRouterSchema = {
  getOutput,
  listOutput,
  getInput,
  removeInput,
  addNotificationTodoInput,
};
