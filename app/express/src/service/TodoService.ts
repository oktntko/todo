import type { z } from '@todo/lib/zod';
import { type Prisma } from '@todo/prisma/client';
import { TodoStatusSchema } from '@todo/prisma/schema';
import { TRPCError } from '@trpc/server';
import { log } from '~/lib/log4js';
import { ProtectedContext } from '~/middleware/trpc';
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
async function listTodo(ctx: ProtectedContext, input: z.infer<typeof TodoRouterSchema.listInput>) {
  log.trace(ctx.reqid, 'listTodo', ctx.operator.user_id, input);

  const AND: Prisma.TodoWhereInput[] = [];
  AND.push({ space_id: input.space_id });
  AND.push({ done_at: input.todo_status === 'active' ? { equals: null } : { not: null } });

  const where: Prisma.TodoWhereInput = {
    space: { owner_id: ctx.operator.user_id },
    AND,
  };
  log.debug(ctx.reqid, 'where', where);

  return TodoRepository.findManyTodo(ctx.prisma, {
    where,
    orderBy: { order: 'asc' },
  });
}

// todo.search
async function searchTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.searchInput>,
) {
  log.trace(ctx.reqid, 'searchTodo', ctx.operator.user_id, input);

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
    space: { owner_id: ctx.operator.user_id },
    AND,
  };
  log.debug(ctx.reqid, 'where', where);

  const orderBy: Prisma.TodoOrderByWithRelationInput =
    input.sort.field === 'space'
      ? {
          space: {
            space_order: input.sort.order,
          },
        }
      : { [input.sort.field]: input.sort.order };
  log.debug(ctx.reqid, 'orderBy', orderBy);

  const total = await TodoRepository.countTodo(ctx.prisma, {
    where,
  });
  const todo_list = await TodoRepository.findManyTodo(ctx.prisma, {
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
async function getTodo(ctx: ProtectedContext, input: z.infer<typeof TodoRouterSchema.getInput>) {
  log.trace(ctx.reqid, 'getTodo', ctx.operator.user_id, input);

  return checkDataExist({
    data: TodoRepository.findUniqueTodo(ctx.prisma, {
      where: {
        todo_id: input.todo_id,
        space: { owner_id: ctx.operator.user_id },
      },
    }),
  });
}

// todo.upsert
async function upsertTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.upsertInput>,
) {
  log.trace(ctx.reqid, 'upsertTodo', ctx.operator.user_id, input);

  await checkRelation(ctx, {
    space_id: input.space_id,
    user_id: ctx.operator.user_id,
  });

  const previous = await TodoRepository.findUniqueTodo(ctx.prisma, {
    where: { todo_id: input.todo_id },
  });
  if (previous && previous.space.owner_id !== ctx.operator.user_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  return TodoRepository.upsertTodo(ctx.prisma, {
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
    operator_id: ctx.operator.user_id,
  });
}

// todo.create
async function createTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.createInput>,
) {
  log.trace(ctx.reqid, 'createTodo', ctx.operator.user_id, input);

  await checkRelation(ctx, {
    space_id: input.space_id,
    user_id: ctx.operator.user_id,
  });

  return TodoRepository.createTodo(ctx.prisma, {
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
    operator_id: ctx.operator.user_id,
  });
}

// todo.update
async function updateTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.updateInput>,
) {
  log.trace(ctx.reqid, 'updateTodo', ctx.operator.user_id, input);

  if (input.space_id) {
    await checkRelation(ctx, {
      space_id: input.space_id,
      user_id: ctx.operator.user_id,
    });
  }

  const previous = await checkPreviousVersion({
    previous: TodoRepository.findUniqueTodo(ctx.prisma, { where: { todo_id: input.todo_id } }),
    updated_at: input.updated_at,
  });
  if (previous.space.owner_id !== ctx.operator.user_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  return TodoRepository.updateTodo(ctx.prisma, {
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
    operator_id: ctx.operator.user_id,
  });
}

// todo.updateMany
async function updateManyTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.updateManyInput>,
) {
  log.trace(ctx.reqid, 'updateManyTodo', ctx.operator.user_id, input);

  if (input.space_id) {
    await checkRelation(ctx, {
      space_id: input.space_id,
      user_id: ctx.operator.user_id,
    });
  }

  await Promise.all(
    input.list.map(async (input) => {
      const previous = await checkPreviousVersion({
        previous: TodoRepository.findUniqueTodo(ctx.prisma, { where: { todo_id: input.todo_id } }),
        updated_at: input.updated_at,
      });
      if (previous.space.owner_id !== ctx.operator.user_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '',
        });
      }
    }),
  );

  return TodoRepository.updateManyTodo(ctx.prisma, {
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
    operator_id: ctx.operator.user_id,
  });
}

// todo.delete
async function deleteTodo(ctx: ProtectedContext, input: z.infer<typeof TodoRouterSchema.getInput>) {
  log.trace(ctx.reqid, 'deleteTodo', ctx.operator.user_id, input);

  const previous = await checkDataExist({
    data: TodoRepository.findUniqueTodo(ctx.prisma, {
      where: { todo_id: input.todo_id },
    }),
  });
  if (previous.space.owner_id !== ctx.operator.user_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  return TodoRepository.deleteTodo(ctx.prisma, {
    where: { todo_id: input.todo_id },
  });
}

// todo.deleteMany
async function deleteManyTodo(
  ctx: ProtectedContext,
  inputList: z.infer<typeof TodoRouterSchema.deleteManyInput>,
) {
  log.trace(ctx.reqid, 'deleteManyTodo', ctx.operator.user_id, inputList);

  await Promise.all(
    inputList.map(async (input) => {
      const previous = await checkDataExist({
        data: TodoRepository.findUniqueTodo(ctx.prisma, {
          where: { todo_id: input.todo_id },
        }),
      });
      if (previous.space.owner_id !== ctx.operator.user_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '',
        });
      }
    }),
  );

  return TodoRepository.deleteManyTodo(ctx.prisma, {
    where: inputList,
  });
}

// ================================================================ //
async function checkRelation(ctx: ProtectedContext, params: { space_id: number; user_id: number }) {
  const space = await SpaceRepository.findUniqueSpace(ctx.prisma, {
    where: { space_id: params.space_id },
  });
  if (space == null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '',
    });
  }
  if (space.owner_id !== params.user_id) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '',
    });
  }

  return space;
}
