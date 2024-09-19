import { Prisma } from '@prisma/client';
import { PrismaClient } from '~/middleware/prisma.js';

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
    orderBy: Prisma.SpaceOrderByWithRelationInput;
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
  },
) {
  return prisma.space.findUnique({
    where: params.where,
  });
}

async function createSpace(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.SpaceUncheckedCreateInput, CommonColumn | 'todo_list'>;
    operator_id: number;
  },
) {
  return prisma.space.create({
    data: {
      owner_id: params.data.owner_id,

      space_name: params.data.space_name,
      space_description: params.data.space_description,
      space_order: params.data.space_order,
      space_image: params.data.space_image,

      created_by: params.operator_id,
      updated_by: params.operator_id,
    },
  });
}

async function updateSpace(
  prisma: PrismaClient,
  params: {
    where: Prisma.SpaceWhereUniqueInput;
    data: Partial<Omit<Prisma.SpaceUncheckedCreateInput, CommonColumn | 'todo_list'>>;
    operator_id: number;
  },
) {
  return prisma.space.update({
    data: {
      space_name: params.data.space_name,
      space_description: params.data.space_description,
      space_order: params.data.space_order,
      space_image: params.data.space_image,

      updated_by: params.operator_id,
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
