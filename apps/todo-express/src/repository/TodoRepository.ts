import { Prisma } from '@prisma/client';
import { PrismaClient } from '~/middleware/prisma';

export const TodoRepository = {
  countTodo,
  findManyTodo,
  findUniqueTodo,
  upsertTodo,
  createTodo,
  updateTodo,
  updateManyTodo,
  deleteTodo,
  deleteManyTodo,
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
      space: true,
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
      space: true,
      file_list: { orderBy: { created_at: 'asc' } },
    },
    where: params.where,
  });
}

async function upsertTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereUniqueInput;
    data: Omit<Prisma.TodoUncheckedCreateInput, CommonColumn>;
    operator_id: number;
  },
) {
  return prisma.todo.upsert({
    include: {
      space: true,
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

      updated_by: params.operator_id,
    },
    where: params.where,
  });
}

async function createTodo(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.TodoUncheckedCreateInput, CommonColumn | 'todo_id'>;
    operator_id: number;
  },
) {
  return prisma.todo.create({
    include: {
      space: true,
      file_list: { orderBy: { created_at: 'asc' } },
    },
    data: {
      space_id: params.data.space_id,

      title: params.data.title,
      description: params.data.description,
      begin_date: params.data.begin_date,
      begin_time: params.data.begin_time,
      limit_date: params.data.limit_date,
      limit_time: params.data.limit_time,
      order: params.data.order,
      done_at: params.data.done_at,

      created_by: params.operator_id,
      updated_by: params.operator_id,
    },
  });
}

async function updateTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereUniqueInput;
    data: Omit<Prisma.TodoUncheckedUpdateInput, CommonColumn | 'todo_id'>;
    operator_id: number;
  },
) {
  return prisma.todo.update({
    include: {
      space: true,
      file_list: { orderBy: { created_at: 'asc' } },
    },
    data: {
      space_id: params.data.space_id,

      title: params.data.title,
      description: params.data.description,
      begin_date: params.data.begin_date,
      begin_time: params.data.begin_time,
      limit_date: params.data.limit_date,
      limit_time: params.data.limit_time,
      order: params.data.order,
      done_at: params.data.done_at,

      created_by: params.operator_id,
      updated_by: params.operator_id,
    },
    where: params.where,
  });
}

async function updateManyTodo(
  prisma: PrismaClient,
  params: {
    where: { todo_id: string }[];
    data: Omit<Prisma.TodoUncheckedUpdateInput, CommonColumn | 'todo_id' | 'tag_list'>;
    operator_id: number;
  },
) {
  return prisma.todo.updateMany({
    data: {
      space_id: params.data.space_id,

      title: params.data.title,
      description: params.data.description,
      begin_date: params.data.begin_date,
      begin_time: params.data.begin_time,
      limit_date: params.data.limit_date,
      limit_time: params.data.limit_time,
      order: params.data.order,
      done_at: params.data.done_at,

      created_by: params.operator_id,
      updated_by: params.operator_id,
    },
    where: {
      todo_id: {
        in: params.where.map((x) => x.todo_id),
      },
    },
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

async function deleteManyTodo(
  prisma: PrismaClient,
  params: {
    where: { todo_id: string }[];
  },
) {
  return prisma.todo.deleteMany({
    where: {
      todo_id: {
        in: params.where.map((x) => x.todo_id),
      },
    },
  });
}
