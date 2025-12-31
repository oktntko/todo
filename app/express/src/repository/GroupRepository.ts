import { type Prisma } from '@todo/prisma/client';
import { type PrismaClient } from '~/middleware/prisma';

export const GroupRepository = {
  countGroup,
  findManyGroup,
  findUniqueGroup,
  createGroup,
  updateGroup,
  deleteGroup,
};

async function countGroup(
  prisma: PrismaClient,
  params: {
    where: Prisma.GroupWhereInput;
  },
) {
  return prisma.group.count({
    where: params.where,
  });
}

async function findManyGroup(
  prisma: PrismaClient,
  params: {
    where: Prisma.GroupWhereInput;
    orderBy: Prisma.GroupOrderByWithRelationInput | Prisma.GroupOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  },
) {
  return prisma.group.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueGroup(
  prisma: PrismaClient,
  params: {
    where: Prisma.GroupWhereUniqueInput;
  },
) {
  return prisma.group.findUnique({
    where: params.where,
  });
}

async function createGroup(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.GroupUncheckedCreateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.group.create({
    data: {
      owner_id: params.data.owner_id,

      group_name: params.data.group_name,
      group_description: params.data.group_description,
      group_order: params.data.group_order,
      group_image: params.data.group_image,
      group_color: params.data.group_color,

      created_by: params.operator_id,
      updated_by: params.operator_id,

      todo_list: params.data.todo_list,
    },
  });
}

async function updateGroup(
  prisma: PrismaClient,
  params: {
    where: Prisma.GroupWhereUniqueInput;
    data: Omit<Prisma.GroupUncheckedUpdateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.group.update({
    data: {
      group_name: params.data.group_name,
      group_description: params.data.group_description,
      group_order: params.data.group_order,
      group_image: params.data.group_image,
      group_color: params.data.group_color,

      updated_by: params.operator_id,

      todo_list: params.data.todo_list,
    },
    where: params.where,
  });
}

async function deleteGroup(
  prisma: PrismaClient,
  params: {
    where: Prisma.GroupWhereUniqueInput;
  },
) {
  return prisma.group.delete({
    where: params.where,
  });
}
