import type { z } from '@todo/lib/zod';

import { type Prisma } from '@todo/prisma/client';
import { TodoStatusSchema } from '@todo/prisma/schema';
import { TRPCError } from '@trpc/server';

import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { message } from '~/lib/message';
import { ProtectedContext } from '~/middleware/trpc';
import { _repository } from '~/repository/_repository';
import { GroupRepository } from '~/repository/GroupRepository';
import { TodoRepository } from '~/repository/TodoRepository';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';
import { GroupService } from '~/service/GroupService';
import { SpaceAuthorization, SpaceService } from '~/service/SpaceService';

export const TodoService = {
  listTodo,
  searchTodo,
  getTodo,
  createTodo,
  updateTodo,
  applyChangeTodo,
  updateManyTodo,
  deleteTodo,
  deleteManyTodo,
};

// todo.list
async function listTodo(ctx: ProtectedContext, input: z.infer<typeof TodoRouterSchema.listInput>) {
  log.trace(ReqCtx.reqid, 'listTodo', ctx.operator.user_id, input);

  const AND: Prisma.TodoWhereInput[] = [];
  AND.push({ group: { space_id: input.space_id } });

  if (input.group_id_list.length > 0) {
    AND.push({ group_id: { in: input.group_id_list } });
  }

  AND.push({ done_at: input.todo_status === 'active' ? { equals: null } : { not: null } });

  log.debug(ReqCtx.reqid, 'where', AND);

  // 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  return TodoRepository.findManyTodo(ctx.prisma, {
    where: {
      ...hasAccessAuthorityWhere,
      AND,
    },
    orderBy: { order: 'asc' },
  });
}

// todo.search
async function searchTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.searchInput>,
) {
  log.trace(ReqCtx.reqid, 'searchTodo', ctx.operator.user_id, input);

  const AND: Prisma.TodoWhereInput[] = [];

  AND.push({
    group: { space_id: input.space_id },
  });

  if (input.where.group_id_list.length > 0) {
    AND.push({ group_id: { in: input.where.group_id_list } });
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

  log.debug(ReqCtx.reqid, 'where', AND);

  const orderBy: Prisma.TodoOrderByWithRelationInput =
    input.sort.field === 'group'
      ? {
          group: {
            group_order: input.sort.order,
          },
        }
      : { [input.sort.field]: input.sort.order };
  log.debug(ReqCtx.reqid, 'orderBy', orderBy);

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const where: Prisma.TodoWhereInput = {
    ...hasAccessAuthorityWhere,
    AND,
  };

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
  log.trace(ReqCtx.reqid, 'getTodo', ctx.operator.user_id, input);

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  return _repository.checkDataExist({
    data: TodoRepository.findUniqueTodo(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        todo_id: input.todo_id,
      },
    }),
  });
}

// todo.create
async function createTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.createInput>,
) {
  log.trace(ReqCtx.reqid, 'createTodo', ctx.operator.user_id, input);
  // 存在チェック & 認可（読み取り権限）の確認
  const { space } = await GroupService.getGroup(ctx, input);

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  return TodoRepository.createTodo(ctx.prisma, {
    operator_id: ctx.operator.user_id,
    data: input,
  });
}

// todo.update
async function updateTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.updateInput>,
) {
  log.trace(ReqCtx.reqid, 'updateTodo', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const current = await _repository.checkVersion({
    current: TodoRepository.findUniqueTodo(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        todo_id: input.todo_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = current.group.space.space_user_list.find(
    (x) => x.user_id === ctx.operator.user_id,
  )?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  // グループの変更がある場合、変更後のグループが同一スペース内であること
  if (input.group_id != null) {
    await _repository.checkDataExist({
      data: GroupRepository.findUniqueGroup(ctx.prisma, {
        operator_id: ctx.operator.user_id,
        where: {
          space_id: current.group.space_id,
          group_id: input.group_id,
        },
      }),
    });
  }

  return TodoRepository.updateTodo(ctx.prisma, {
    where: {
      todo_id: input.todo_id,
    },
    operator_id: ctx.operator.user_id,
    data: input,
  });
}

// todo.applyChange
async function applyChangeTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.applyChangeInput>,
) {
  log.trace(ReqCtx.reqid, 'applyChangeTodo', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const current = await _repository.checkDataExist({
    data: TodoRepository.findUniqueTodo(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        todo_id: input.todo_id,
      },
    }),
  });

  // 認可（変更権限）の確認
  const user_role = current.group.space.space_user_list.find(
    (x) => x.user_id === ctx.operator.user_id,
  )?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  // グループの変更がある場合、変更後のグループが同一スペース内であること
  if (input.group_id != null) {
    await _repository.checkDataExist({
      data: GroupRepository.findUniqueGroup(ctx.prisma, {
        operator_id: ctx.operator.user_id,
        where: {
          space_id: current.group.space_id,
          group_id: input.group_id,
        },
      }),
    });
  }

  return TodoRepository.updateTodo(ctx.prisma, {
    where: {
      todo_id: input.todo_id,
    },
    operator_id: ctx.operator.user_id,
    data: input,
  });
}

// todo.updateMany
async function updateManyTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.updateManyInput>,
) {
  log.trace(ReqCtx.reqid, 'updateManyTodo', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace(ctx, input);

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  // グループの変更がある場合、変更後のグループが同一スペース内であること
  if (input.data.group_id != null) {
    await _repository.checkDataExist({
      data: GroupRepository.findUniqueGroup(ctx.prisma, {
        operator_id: ctx.operator.user_id,
        where: {
          space_id: space.space_id,
          group_id: input.data.group_id,
        },
      }),
    });
  }

  // 権限チェック、存在チェック、排他チェック
  const currentList = await TodoRepository.findManyTodo(ctx.prisma, {
    where: {
      group: {
        space_id: input.space_id, // 入力値の space_id と一致すること
      },
      todo_id: {
        in: input.target_list.map((x) => x.todo_id), // 存在すること
      },
    },
    orderBy: { order: 'asc' },
  });

  for (const target of input.target_list) {
    const current = currentList.find((x) => x.todo_id === target.todo_id);
    if (current == null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    }

    if (current.updated_at.getDate() !== target.updated_at.getDate()) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: message.error.CONFLICT_CURRENT_UPDATED,
      });
    }
  }

  await TodoRepository.updateManyTodo(ctx.prisma, {
    where: {
      todo_id: { in: input.target_list.map((x) => x.todo_id) },
    },
    operator_id: ctx.operator.user_id,
    data: input.data,
  });

  return { ok: true } as const;
}

// todo.delete
async function deleteTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteTodo', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const current = await _repository.checkVersion({
    current: TodoRepository.findUniqueTodo(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        todo_id: input.todo_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = current.group.space.space_user_list.find(
    (x) => x.user_id === ctx.operator.user_id,
  )?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  await TodoRepository.deleteTodo(ctx.prisma, {
    where: { todo_id: input.todo_id },
  });

  return { todo_id: input.todo_id };
}

// todo.deleteMany
async function deleteManyTodo(
  ctx: ProtectedContext,
  input: z.infer<typeof TodoRouterSchema.deleteManyInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteManyTodo', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace(ctx, input);

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  // 権限チェック、存在チェック、排他チェック
  const currentList = await TodoRepository.findManyTodo(ctx.prisma, {
    where: {
      group: {
        space_id: input.space_id, // 入力値の space_id と一致すること
      },
      todo_id: {
        in: input.target_list.map((x) => x.todo_id), // 存在すること
      },
    },
    orderBy: { order: 'asc' },
  });

  for (const target of input.target_list) {
    const current = currentList.find((x) => x.todo_id === target.todo_id);
    if (current == null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    }

    if (current.updated_at.getDate() !== target.updated_at.getDate()) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: message.error.CONFLICT_CURRENT_UPDATED,
      });
    }
  }

  await TodoRepository.deleteManyTodo(ctx.prisma, {
    where: {
      todo_id: { in: input.target_list.map((x) => x.todo_id) },
    },
  });

  return { ok: true } as const;
}

// #region Authorization
function generateHasAccessAuthorityWhere(user_id: string) {
  return {
    group: {
      space: {
        space_user_list: {
          some: {
            user_id,
          },
        },
      },
    },
  } as const satisfies Prisma.TodoWhereInput;
}
// #endregion Authorization
