import { Prisma } from '@prisma/client';
import { PrismaClient } from '~/middleware/prisma.js';

export const TagRepository = {
  countTag,
  findManyTag,
  findUniqueTag,
  createTag,
  updateTag,
  deleteTag,
};

async function countTag(
  prisma: PrismaClient,
  params: {
    where: Prisma.TagWhereInput;
  },
) {
  return prisma.tag.count({
    where: params.where,
  });
}

async function findManyTag(
  prisma: PrismaClient,
  params: {
    where: Prisma.TagWhereInput;
    orderBy: Prisma.TagOrderByWithRelationInput;
    take?: number;
    skip?: number;
  },
) {
  return prisma.tag.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueTag(
  prisma: PrismaClient,
  params: {
    where: Prisma.TagWhereUniqueInput;
  },
) {
  return prisma.tag.findUnique({
    where: params.where,
  });
}

async function createTag(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.TagUncheckedCreateInput, CommonColumn | 'todo_list'>;
    operator_id: number;
  },
) {
  return prisma.tag.create({
    data: {
      owner_id: params.data.owner_id,

      tag_name: params.data.tag_name,
      tag_description: params.data.tag_description,
      tag_color: params.data.tag_color,
      tag_order: params.data.tag_order,

      created_by: params.operator_id,
      updated_by: params.operator_id,
    },
  });
}

async function updateTag(
  prisma: PrismaClient,
  params: {
    where: Prisma.TagWhereUniqueInput;
    data: Partial<Omit<Prisma.TagUncheckedCreateInput, CommonColumn | 'todo_list'>>;
    operator_id: number;
  },
) {
  return prisma.tag.update({
    data: {
      tag_name: params.data.tag_name,
      tag_description: params.data.tag_description,
      tag_color: params.data.tag_color,
      tag_order: params.data.tag_order,

      updated_by: params.operator_id,
    },
    where: params.where,
  });
}

async function deleteTag(
  prisma: PrismaClient,
  params: {
    where: Prisma.TagWhereUniqueInput;
  },
) {
  return prisma.tag.delete({
    where: params.where,
  });
}
