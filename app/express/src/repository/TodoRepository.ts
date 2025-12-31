import { type Prisma } from '@todo/prisma/client';
import { type PrismaClient } from '~/middleware/prisma';

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
    orderBy: Prisma.TodoOrderByWithRelationInput | Prisma.TodoOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  },
) {
  return prisma.todo.findMany({
    include: {
      group: true,
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
      group: true,
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
    operator_id: string;
  },
) {
  return prisma.todo.upsert({
    include: {
      group: true,
      file_list: { orderBy: { created_at: 'asc' } },
    },
    create: {
      todo_id: params.data.todo_id,

      group_id: params.data.group_id,

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
      group_id: params.data.group_id,

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
    data: Omit<Prisma.TodoUncheckedCreateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.todo.create({
    include: {
      group: true,
      file_list: { orderBy: { created_at: 'asc' } },
    },
    data: {
      group_id: params.data.group_id,

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
    data: Omit<Prisma.TodoUncheckedUpdateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.todo.update({
    include: {
      group: true,
      file_list: { orderBy: { created_at: 'asc' } },
    },
    data: {
      group_id: params.data.group_id,

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
    where: Prisma.TodoWhereInput;
    data: Omit<Prisma.TodoUncheckedUpdateInput, CommonColumn>;
    operator_id: string;
  },
) {
  return prisma.todo.updateMany({
    data: {
      group_id: params.data.group_id,

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

async function deleteTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereUniqueInput;
  },
) {
  return prisma.todo.delete({
    include: {
      group: true,
      file_list: { orderBy: { created_at: 'asc' } },
    },
    where: params.where,
  });
}

async function deleteManyTodo(
  prisma: PrismaClient,
  params: {
    where: Prisma.TodoWhereInput;
  },
) {
  return prisma.todo.deleteMany({
    where: params.where,
  });
}
