import { type Prisma } from '@todo/prisma/client';
import { type PrismaClient } from '~/middleware/prisma';

export const WhiteboardRepository = {
  countWhiteboard,
  findManyWhiteboard,
  findUniqueWhiteboard,
  createWhiteboard,
  updateWhiteboard,
  deleteWhiteboard,
};

async function countWhiteboard(
  prisma: PrismaClient,
  params: {
    where: Prisma.WhiteboardWhereInput;
  },
) {
  return prisma.whiteboard.count({
    where: params.where,
  });
}

async function findManyWhiteboard(
  prisma: PrismaClient,
  params: {
    where: Prisma.WhiteboardWhereInput;
    orderBy: Prisma.WhiteboardOrderByWithRelationInput;
    take?: number;
    skip?: number;
  },
) {
  return prisma.whiteboard.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueWhiteboard(
  prisma: PrismaClient,
  params: {
    where: Prisma.WhiteboardWhereUniqueInput;
  },
) {
  return prisma.whiteboard.findUnique({
    where: params.where,
  });
}

async function createWhiteboard(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.WhiteboardUncheckedCreateInput, CommonColumn>;
    operator_id: number;
  },
) {
  return prisma.whiteboard.create({
    data: {
      owner_id: params.data.owner_id,

      whiteboard_name: params.data.whiteboard_name,
      whiteboard_description: params.data.whiteboard_description,
      whiteboard_order: params.data.whiteboard_order,
      whiteboard_content: params.data.whiteboard_content,

      created_by: params.operator_id,
      updated_by: params.operator_id,
    },
  });
}

async function updateWhiteboard(
  prisma: PrismaClient,
  params: {
    where: Prisma.WhiteboardWhereUniqueInput;
    data: Partial<Omit<Prisma.WhiteboardUncheckedCreateInput, CommonColumn>>;
    operator_id: number;
  },
) {
  return prisma.whiteboard.update({
    data: {
      whiteboard_name: params.data.whiteboard_name,
      whiteboard_description: params.data.whiteboard_description,
      whiteboard_order: params.data.whiteboard_order,
      whiteboard_content: params.data.whiteboard_content,

      updated_by: params.operator_id,
    },
    where: params.where,
  });
}

async function deleteWhiteboard(
  prisma: PrismaClient,
  params: {
    where: Prisma.WhiteboardWhereUniqueInput;
  },
) {
  return prisma.whiteboard.delete({
    where: params.where,
  });
}
