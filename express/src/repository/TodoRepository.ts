import { Prisma } from '@prisma/client';
import { PrismaClient } from '~/middleware/prisma.js';

export const TodoRepository = {
  countTodo,
  findManyTodo,
  findUniqueTodo,
  upsertTodo,
  deleteTodo,
};

async function countTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereInput;
  },
) {
  return prisma.todo.count({
    where: params.where,
  });
}

async function findManyTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereInput;
    orderBy: Prisma.TodoOrderByWithRelationInput;
    take?: number;
    skip?: number;
  },
) {
  return prisma.todo.findMany({
    include: {
      tag_list: { orderBy: { tag_order: 'asc' } },
      file_list: { orderBy: { created_at: 'asc' } },
    },
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereUniqueInput;
  },
) {
  return prisma.todo.findUnique({
    include: {
      tag_list: { orderBy: { tag_order: 'asc' } },
      file_list: { orderBy: { created_at: 'asc' } },
    },
    where: params.where,
  });
}

async function upsertTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereUniqueInput;
    data: Omit<Prisma.TodoUncheckedCreateInput, CommonColumn | 'tag_list'> & {
      tag_list: Prisma.TagWhereUniqueInput[];
    };
    operator_id: number;
  },
) {
  return prisma.todo.upsert({
    include: {
      tag_list: { orderBy: { tag_order: 'asc' } },
      file_list: { orderBy: { created_at: 'asc' } },
    },
    create: {
      todo_id: params.data.todo_id,

      space_id: params.data.space_id,

      title: params.data.title,
      description: params.data.description,
      begin_date: params.data.begin_date,
      begin_time: params.data.begin_time,
      limit_date: params.data.limit_date,
      limit_time: params.data.limit_time,
      order: params.data.order,
      done_at: params.data.done_at,

      tag_list: { connect: params.data.tag_list },

      created_by: params.operator_id,
      updated_by: params.operator_id,
    },
    update: {
      space_id: params.data.space_id,

      title: params.data.title,
      description: params.data.description,
      begin_date: params.data.begin_date,
      begin_time: params.data.begin_time,
      limit_date: params.data.limit_date,
      limit_time: params.data.limit_time,
      order: params.data.order,
      done_at: params.data.done_at,

      tag_list: { connect: params.data.tag_list },

      updated_by: params.operator_id,
    },
    where: params.where,
  });
}

async function deleteTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereUniqueInput;
  },
) {
  return prisma.todo.delete({
    where: params.where,
  });
}
