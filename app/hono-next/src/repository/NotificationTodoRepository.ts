import { type Prisma } from '@todo/prisma/client';

import { type PrismaClient } from '~/middleware/prisma';

export const NotificationTodoRepository = {
  countNotificationTodo,
  findManyNotificationTodo,
  findUniqueNotificationTodo,
  createNotificationTodo,
  updateNotificationTodo,
  updateManyNotificationTodo,
  deleteNotificationTodo,
  deleteManyNotificationTodo,
};

async function countNotificationTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationTodoWhereInput;
  },
) {
  return prisma.notificationTodo.count({
    where: params.where,
  });
}

async function findManyNotificationTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationTodoWhereInput;
    orderBy:
      | Prisma.NotificationTodoOrderByWithRelationInput
      | Prisma.NotificationTodoOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  },
) {
  return prisma.notificationTodo.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueNotificationTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationTodoWhereUniqueInput;
  },
) {
  return prisma.notificationTodo.findUnique({
    where: params.where,
  });
}

async function createNotificationTodo(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.NotificationTodoUncheckedCreateInput, CommonColumn>;
  },
) {
  return prisma.notificationTodo.create({
    data: {
      user_id: params.data.user_id,
      notification_title: params.data.notification_title,
      notification_body: params.data.notification_body,
      notification_link: params.data.notification_link,
      notification_status: params.data.notification_status,
      notification_at: params.data.notification_at,
      todo_id: params.data.todo_id,
    },
  });
}

async function updateNotificationTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationTodoWhereUniqueInput;
    data: Omit<Prisma.NotificationTodoUncheckedUpdateInput, CommonColumn>;
  },
) {
  return prisma.notificationTodo.update({
    data: {
      notification_title: params.data.notification_title,
      notification_body: params.data.notification_body,
      notification_link: params.data.notification_link,
      notification_status: params.data.notification_status,
      notification_at: params.data.notification_at,
      todo_id: params.data.todo_id,
    },
    where: params.where,
  });
}

async function updateManyNotificationTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationTodoWhereInput;
    data: Omit<Prisma.NotificationTodoUncheckedUpdateInput, CommonColumn>;
  },
) {
  return prisma.notificationTodo.updateMany({
    data: {
      notification_title: params.data.notification_title,
      notification_body: params.data.notification_body,
      notification_link: params.data.notification_link,
      notification_status: params.data.notification_status,
      notification_at: params.data.notification_at,
      todo_id: params.data.todo_id,
    },
    where: params.where,
  });
}

async function deleteNotificationTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationTodoWhereUniqueInput;
  },
) {
  return prisma.notificationTodo.delete({
    where: params.where,
  });
}

async function deleteManyNotificationTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationTodoWhereInput;
  },
) {
  return prisma.notificationTodo.deleteMany({
    where: params.where,
  });
}
