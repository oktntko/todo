import type { z } from '@todo/lib/zod';
import { type Prisma } from '@todo/prisma/client';
import { TodoStatusSchema } from '@todo/prisma/schema';
import { TRPCError } from '@trpc/server';
import { log } from '~/lib/log4js';
import { type PrismaClient } from '~/middleware/prisma';
import { checkDataExist, checkPreviousVersion } from '~/repository/_repository';
import { SpaceRepository } from '~/repository/SpaceRepository';
import { TodoRepository } from '~/repository/TodoRepository';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

export const TodoService = {
  listTodo,
  searchTodo,
  getTodo,
  upsertTodo,
  createTodo,
  updateTodo,
  updateManyTodo,
  deleteTodo,
  deleteManyTodo,
};

// todo.list
async function listTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.listInput>,
) {
  log.trace(reqid, 'listTodo', operator_id, input);

  const AND: Prisma.TodoWhereInput[] = [];
  AND.push({ space_id: input.space_id });
  AND.push({ done_at: input.todo_status === 'active' ? { equals: null } : { not: null } });

  const where: Prisma.TodoWhereInput = {
    space: { owner_id: operator_id },
    AND,
  };
  log.debug(reqid, 'where', where);

  return TodoRepository.findManyTodo(prisma, {
    where,
    orderBy: { order: 'asc' },
  });
}

// todo.search
async function searchTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.searchInput>,
) {
  log.trace(reqid, 'searchTodo', operator_id, input);

  const AND: Prisma.TodoWhereInput[] = [];

  if (input.where.space_id) {
    AND.push({ space_id: input.where.space_id });
  }
  if (input.where.todo_keyword) {
    AND.push({
      OR: [
        { title: { contains: input.where.todo_keyword } },
        { description: { contains: input.where.todo_keyword } },
      ],
    });
  }
  if (
    input.where.todo_status.length > 0 &&
    input.where.todo_status.length !== TodoStatusSchema.options.length
  ) {
    AND.push({
      OR: input.where.todo_status.map((todo_status) => {
        switch (todo_status) {
          case 'active': {
            return { done_at: { equals: null } };
          }
          case 'done': {
            return { done_at: { not: null } };
          }
        }
      }),
    });
  }

  const where: Prisma.TodoWhereInput = {
    space: { owner_id: operator_id },
    AND,
  };
  log.debug(reqid, 'where', where);

  const orderBy: Prisma.TodoOrderByWithRelationInput =
    input.sort.field === 'space'
      ? {
          space: {
            space_order: input.sort.order,
          },
        }
      : { [input.sort.field]: input.sort.order };
  log.debug(reqid, 'orderBy', orderBy);

  const total = await TodoRepository.countTodo(prisma, {
    where,
  });
  const todo_list = await TodoRepository.findManyTodo(prisma, {
    where,
    orderBy,
    take: input.limit,
    skip: input.limit * (input.page - 1),
  });

  return {
    total,
    todo_list,
  } satisfies z.infer<typeof TodoRouterSchema.searchOutput>;
}

// todo.get
async function getTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.getInput>,
) {
  log.trace(reqid, 'getTodo', operator_id, input);

  return checkDataExist({
    data: TodoRepository.findUniqueTodo(prisma, {
      where: {
        todo_id: input.todo_id,
        space: { owner_id: operator_id },
      },
    }),
  });
}

// todo.upsert
async function upsertTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.upsertInput>,
) {
  log.trace(reqid, 'upsertTodo', operator_id, input);

  await checkRelation(prisma, {
    space_id: input.space_id,
    operator_id,
  });

  const previous = await TodoRepository.findUniqueTodo(prisma, {
    where: { todo_id: input.todo_id },
  });
  if (previous && previous.space.owner_id !== operator_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  return TodoRepository.upsertTodo(prisma, {
    where: {
      todo_id: input.todo_id,
    },
    data: {
      todo_id: input.todo_id,

      space_id: input.space_id,

      title: input.title,
      description: input.description,
      begin_date: input.begin_date,
      begin_time: input.begin_time,
      limit_date: input.limit_date,
      limit_time: input.limit_time,
      order: input.order,
      done_at: input.done_at,
    },
    operator_id,
  });
}

// todo.create
async function createTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.createInput>,
) {
  log.trace(reqid, 'createTodo', operator_id, input);

  await checkRelation(prisma, {
    space_id: input.space_id,
    operator_id,
  });

  return TodoRepository.createTodo(prisma, {
    data: {
      space_id: input.space_id,

      title: input.title,
      description: input.description,
      begin_date: input.begin_date,
      begin_time: input.begin_time,
      limit_date: input.limit_date,
      limit_time: input.limit_time,
      order: input.order,
      done_at: input.done_at,
    },
    operator_id,
  });
}

// todo.update
async function updateTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.updateInput>,
) {
  log.trace(reqid, 'updateTodo', operator_id, input);

  if (input.space_id) {
    await checkRelation(prisma, {
      space_id: input.space_id,
      operator_id,
    });
  }

  const previous = await checkPreviousVersion({
    previous: TodoRepository.findUniqueTodo(prisma, { where: { todo_id: input.todo_id } }),
    updated_at: input.updated_at,
  });
  if (previous.space.owner_id !== operator_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  return TodoRepository.updateTodo(prisma, {
    data: {
      space_id: input.space_id,

      title: input.title,
      description: input.description,
      begin_date: input.begin_date,
      begin_time: input.begin_time,
      limit_date: input.limit_date,
      limit_time: input.limit_time,
      order: input.order,
      done_at: input.done_at,
    },
    where: {
      todo_id: input.todo_id,
    },
    operator_id,
  });
}

// todo.updateMany
async function updateManyTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.updateManyInput>,
) {
  log.trace(reqid, 'updateManyTodo', operator_id, input);

  if (input.space_id) {
    await checkRelation(prisma, {
      space_id: input.space_id,
      operator_id,
    });
  }

  await Promise.all(
    input.list.map(async (input) => {
      const previous = await checkPreviousVersion({
        previous: TodoRepository.findUniqueTodo(prisma, { where: { todo_id: input.todo_id } }),
        updated_at: input.updated_at,
      });
      if (previous.space.owner_id !== operator_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '',
        });
      }
    }),
  );

  return TodoRepository.updateManyTodo(prisma, {
    data: {
      space_id: input.space_id,

      title: input.title,
      description: input.description,
      begin_date: input.begin_date,
      begin_time: input.begin_time,
      limit_date: input.limit_date,
      limit_time: input.limit_time,
      order: input.order,
      done_at: input.done_at,
    },
    where: input.list,
    operator_id,
  });
}

// todo.delete
async function deleteTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.getInput>,
) {
  log.trace(reqid, 'deleteTodo', operator_id, input);

  const previous = await checkDataExist({
    data: TodoRepository.findUniqueTodo(prisma, {
      where: { todo_id: input.todo_id },
    }),
  });
  if (previous.space.owner_id !== operator_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  return TodoRepository.deleteTodo(prisma, {
    where: { todo_id: input.todo_id },
  });
}

// todo.deleteMany
async function deleteManyTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  inputList: z.infer<typeof TodoRouterSchema.deleteManyInput>,
) {
  log.trace(reqid, 'deleteManyTodo', operator_id, inputList);

  await Promise.all(
    inputList.map(async (input) => {
      const previous = await checkDataExist({
        data: TodoRepository.findUniqueTodo(prisma, {
          where: { todo_id: input.todo_id },
        }),
      });
      if (previous.space.owner_id !== operator_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '',
        });
      }
    }),
  );

  return TodoRepository.deleteManyTodo(prisma, {
    where: inputList,
  });
}

// ================================================================ //
async function checkRelation(
  prisma: PrismaClient,
  params: { space_id: number; operator_id: number },
) {
  const space = await SpaceRepository.findUniqueSpace(prisma, {
    where: { space_id: params.space_id },
  });
  if (space == null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '',
    });
  }
  if (space.owner_id !== params.operator_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  return space;
}
