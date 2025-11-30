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
    include: {
      _count: {
        select: {
          todo_list: true,
        },
      },
    },
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
  },
) {
  return prisma.space.findUnique({
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
      owner_id: params.data.owner_id,

      space_name: params.data.space_name,
      space_description: params.data.space_description,
      space_order: params.data.space_order,
      space_image: params.data.space_image,
      space_color: params.data.space_color,

      created_by: params.operator_id,
      updated_by: params.operator_id,

      todo_list: params.data.todo_list,
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
      space_order: params.data.space_order,
      space_image: params.data.space_image,
      space_color: params.data.space_color,

      updated_by: params.operator_id,

      todo_list: params.data.todo_list,
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
