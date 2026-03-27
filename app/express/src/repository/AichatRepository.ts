import { type Prisma } from '@todo/prisma/client';

import { type PrismaClient } from '~/middleware/prisma';

export const AichatRepository = {
  countAichat,
  findManyAichat,
  findUniqueAichat,
  createAichat,
  updateAichat,
  deleteAichat,
  findUniqueAichatListMessage,
};

async function countAichat(
  prisma: PrismaClient,
  params: {
    where: Prisma.AichatWhereInput;
  },
) {
  return prisma.aichat.count({
    where: params.where,
  });
}

async function findManyAichat(
  prisma: PrismaClient,
  params: {
    where: Prisma.AichatWhereInput;
    orderBy: Prisma.AichatOrderByWithRelationInput | Prisma.AichatOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  },
) {
  return prisma.aichat.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueAichat(
  prisma: PrismaClient,
  params: {
    where: Prisma.AichatWhereUniqueInput;
    operator_id: string;
  },
) {
  return prisma.aichat.findUnique({
    include: {
      space: {
        include: {
          space_user_list: {
            where: {
              user_id: params.operator_id,
            },
          },
        },
      },
    },
    where: params.where,
  });
}

async function createAichat(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.AichatUncheckedCreateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.aichat.create({
    data: {
      space_id: params.data.space_id,

      aichat_title: params.data.aichat_title,

      created_by: params.operator_id,
      updated_by: params.operator_id,

      aichat_message_list: params.data.aichat_message_list,
    },
  });
}

async function updateAichat(
  prisma: PrismaClient,
  params: {
    where: Prisma.AichatWhereUniqueInput;
    data: Omit<Prisma.AichatUncheckedUpdateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.aichat.update({
    data: {
      aichat_title: params.data.aichat_title,

      updated_by: params.operator_id,

      aichat_message_list: params.data.aichat_message_list,
    },
    where: params.where,
  });
}

async function deleteAichat(
  prisma: PrismaClient,
  params: {
    where: Prisma.AichatWhereUniqueInput;
  },
) {
  return prisma.aichat.delete({
    where: params.where,
  });
}

async function findUniqueAichatListMessage(
  prisma: PrismaClient,
  params: {
    where: Prisma.AichatWhereUniqueInput;
  },
) {
  return prisma.aichat.findUniqueOrThrow({
    where: params.where,
    include: {
      aichat_message_list: {
        include: {
          user: {
            select: {
              username: true,
              avatar_image: true,
            },
          },
        },
        orderBy: {
          created_at: 'asc',
        },
      },
    },
  });
}
