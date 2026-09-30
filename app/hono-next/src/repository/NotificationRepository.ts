import { type Prisma } from '@todo/prisma/client';

import { type PrismaClient } from '~/middleware/prisma';

export const NotificationRepository = {
  countNotification,
  findManyNotification,
  findUniqueNotification,
  createNotification,
  updateNotification,
  updateManyNotification,
  deleteNotification,
  deleteManyNotification,
};

async function countNotification(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationWhereInput;
  },
) {
  return prisma.notification.count({
    where: params.where,
  });
}

async function findManyNotification(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationWhereInput;
    orderBy:
      | Prisma.NotificationOrderByWithRelationInput
      | Prisma.NotificationOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  },
) {
  return prisma.notification.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueNotification(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationWhereUniqueInput;
  },
) {
  return prisma.notification.findUnique({
    where: params.where,
  });
}

async function createNotification(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.NotificationUncheckedCreateInput, CommonColumn>;
  },
) {
  return prisma.notification.create({
    data: {
      user_id: params.data.user_id,
      notification_title: params.data.notification_title,
      notification_body: params.data.notification_body,
      notification_link: params.data.notification_link,
      notification_status: params.data.notification_status,
      notification_at: params.data.notification_at,
    },
  });
}

async function updateNotification(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationWhereUniqueInput;
    data: Omit<Prisma.NotificationUncheckedUpdateInput, CommonColumn>;
  },
) {
  return prisma.notification.update({
    data: {
      notification_title: params.data.notification_title,
      notification_body: params.data.notification_body,
      notification_link: params.data.notification_link,
      notification_status: params.data.notification_status,
      notification_at: params.data.notification_at,
    },
    where: params.where,
  });
}

async function updateManyNotification(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationWhereInput;
    data: Omit<Prisma.NotificationUncheckedUpdateInput, CommonColumn>;
  },
) {
  return prisma.notification.updateMany({
    data: {
      notification_title: params.data.notification_title,
      notification_body: params.data.notification_body,
      notification_link: params.data.notification_link,
      notification_status: params.data.notification_status,
      notification_at: params.data.notification_at,
    },
    where: params.where,
  });
}

async function deleteNotification(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationWhereUniqueInput;
  },
) {
  return prisma.notification.delete({
    where: params.where,
  });
}

async function deleteManyNotification(
  prisma: PrismaClient,
  params: {
    where: Prisma.NotificationWhereInput;
  },
) {
  return prisma.notification.deleteMany({
    where: params.where,
  });
}
