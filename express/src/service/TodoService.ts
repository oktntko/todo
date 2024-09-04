import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { log } from '~/lib/log4js.js';
import { z } from '~/lib/zod.js';
import { PrismaClient } from '~/middleware/prisma.js';
import { checkDataExist } from '~/repository/_repository.js';
import { SpaceRepository } from '~/repository/SpaceRepository.js';
import { TodoRepository } from '~/repository/TodoRepository.js';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema.js';

export const TodoService = {
  listTodo,
  getTodo,
  upsertTodo,
  deleteTodo,
};

// todo.list
async function listTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.listInput>,
) {
  log.trace(reqid, 'listTodo', operator_id, input);

  const where: Prisma.TodoWhereInput = {
    space: { owner_id: operator_id },
  };
  if (input.where.space_id) {
    where.space_id = input.where.space_id;
  }
  if (input.where.todo_keyword) {
    where.OR = [
      { title: { contains: input.where.todo_keyword } },
      { description: { contains: input.where.todo_keyword } },
    ];
  }
  if (input.where.todo_status) {
    switch (input.where.todo_status) {
      case 'active': {
        where.done_at = { equals: null };
        break;
      }
      case 'done': {
        where.done_at = { not: null };
        break;
      }
    }
  }
  log.debug(reqid, 'where', where);

  const total = await TodoRepository.countTodo(prisma, {
    where,
  });
  const todo_list = await TodoRepository.findManyTodo(prisma, {
    where,
    orderBy: { [input.sort.field]: input.sort.order },
  });

  return {
    total,
    todo_list,
  } satisfies z.infer<typeof TodoRouterSchema.listOutput>;
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

  // check relation
  const space = await SpaceRepository.findUniqueSpace(prisma, {
    where: { space_id: input.space_id },
  });
  if (space == null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '',
    });
  }
  if (space.owner_id !== operator_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  // edit input [order]
  const previous = await TodoRepository.findUniqueTodo(prisma, {
    where: { todo_id: input.todo_id },
  });
  const order =
    previous != null
      ? previous.order
      : await TodoRepository.countTodo(prisma, { where: { space_id: input.space_id } });

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
      order: order,
      done_at: input.done_at,

      tag_list: input.tag_list,
    },
    operator_id,
  });
}

// todo.delete
async function deleteTodo(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TodoRouterSchema.deleteInput>,
) {
  log.trace(reqid, 'deleteTodo', operator_id, input);

  await checkDataExist({
    data: TodoRepository.findUniqueTodo(prisma, {
      where: {
        todo_id: input.todo_id,
        space: { owner_id: operator_id },
      },
    }),
  });

  return TodoRepository.deleteTodo(prisma, {
    where: { todo_id: input.todo_id },
  });
}
