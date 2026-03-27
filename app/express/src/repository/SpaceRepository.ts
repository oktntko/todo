import { type Prisma } from '@todo/prisma/client';

import { type PrismaClient } from '~/middleware/prisma';

export const SpaceRepository = {
  countSpace,
  findManySpace,
  findUniqueSpace,
  createSpace,
  updateSpace,
  deleteSpace,
};

async function countSpace(
  prisma: PrismaClient,
  params: {
    where: Prisma.SpaceWhereInput;
  },
) {
  return prisma.space.count({
    where: params.where,
  });
}

async function findManySpace(
  prisma: PrismaClient,
  params: {
    where: Prisma.SpaceWhereInput;
    orderBy: Prisma.SpaceOrderByWithRelationInput | Prisma.SpaceOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  },
) {
  return prisma.space.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueSpace(
  prisma: PrismaClient,
  params: {
    where: Prisma.SpaceWhereUniqueInput;
    operator_id: string;
  },
) {
  return prisma.space.findUnique({
    include: {
      space_user_list: {
        where: {
          user_id: params.operator_id,
        },
      },
    },
    where: params.where,
  });
}

async function createSpace(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.SpaceUncheckedCreateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.space.create({
    data: {
      space_name: params.data.space_name,
      space_description: params.data.space_description,
      space_image: params.data.space_image,
      space_color: params.data.space_color,
      aichat_enable: params.data.aichat_enable,
      aichat_api_key: params.data.aichat_api_key,

      created_by: params.operator_id,
      updated_by: params.operator_id,

      space_user_list: params.data.space_user_list,
      group_list: params.data.group_list,
      whiteboard_list: params.data.whiteboard_list,
      file_list: params.data.file_list,
    },
  });
}

async function updateSpace(
  prisma: PrismaClient,
  params: {
    where: Prisma.SpaceWhereUniqueInput;
    data: Omit<Prisma.SpaceUncheckedUpdateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.space.update({
    data: {
      space_name: params.data.space_name,
      space_description: params.data.space_description,
      space_image: params.data.space_image,
      space_color: params.data.space_color,
      aichat_enable: params.data.aichat_enable,
      aichat_api_key: params.data.aichat_api_key,

      updated_by: params.operator_id,

      space_user_list: params.data.space_user_list,
      group_list: params.data.group_list,
      whiteboard_list: params.data.whiteboard_list,
      file_list: params.data.file_list,
    },
    where: params.where,
  });
}

async function deleteSpace(
  prisma: PrismaClient,
  params: {
    where: Prisma.SpaceWhereUniqueInput;
  },
) {
  return prisma.space.delete({
    where: params.where,
  });
}
