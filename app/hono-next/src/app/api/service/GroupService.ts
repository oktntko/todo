import type { z } from '@todo/lib';
import { type Prisma } from '@todo/prisma/client';
import { HTTPException } from 'hono/http-exception';

import { ReqCtx } from '@/app/api/lib/context';
import { message } from '@/app/api/lib/message';
import type { OperatorMinimum } from '@/app/api/middleware/auth';
import { StatusCode } from '@/app/api/middleware/hono';
import type { PrismaClient } from '@/app/api/middleware/prisma';
import { _repository } from '@/app/api/repository/_repository';
import { GroupRepository } from '@/app/api/repository/GroupRepository';
import { SpaceRepository } from '@/app/api/repository/SpaceRepository';
import { GroupRouterSchema } from '@/app/api/schema/GroupRouterSchema';
import { SpaceAuthorization, SpaceService } from '@/app/api/service/SpaceService';

export const GroupService = {
  listGroup,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  reorderGroup,
};

// group.list
async function listGroup({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof GroupRouterSchema.listInput>;
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'listGroup %o', input);

  const AND: Prisma.GroupWhereInput[] = [];
  AND.push({ space_id: input.space_id });

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const where: Prisma.GroupWhereInput = {
    ...hasAccessAuthorityWhere,
    AND,
  };

  return GroupRepository.findManyGroup(ctx.prisma, {
    where,
    orderBy: { group_order: 'asc' },
  });
}

// group.get
async function getGroup({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof GroupRouterSchema.getInput>;
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'getGroup %o', input);

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  return _repository.checkDataExist({
    data: GroupRepository.findUniqueGroup(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        group_id: input.group_id,
      },
    }),
  });
}

// group.create
async function createGroup({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof GroupRouterSchema.createInput>;
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'createGroup %o', input);
  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace({ input, ...ctx });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN'], user_role });

  const count = await GroupRepository.countGroup(ctx.prisma, {
    where: { space_id: input.space_id },
  });

  return GroupRepository.createGroup(ctx.prisma, {
    operator_id: ctx.operator.user_id,
    data: {
      ...input,
      group_order: count,
    },
  });
}

// group.update
async function updateGroup({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof GroupRouterSchema.updateInput>;
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'updateGroup %o', input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkVersion({
    current: GroupRepository.findUniqueGroup(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        group_id: input.group_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN'], user_role });

  return GroupRepository.updateGroup(ctx.prisma, {
    where: { group_id: input.group_id },
    operator_id: ctx.operator.user_id,
    data: input,
  });
}

// group.delete
async function deleteGroup({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof GroupRouterSchema.deleteInput>;
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'deleteGroup %o', input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkVersion({
    current: GroupRepository.findUniqueGroup(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        group_id: input.group_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN'], user_role });

  await GroupRepository.deleteGroup(ctx.prisma, {
    where: { group_id: input.group_id },
  });

  return { group_id: input.group_id };
}

// group.reorder
async function reorderGroup({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof GroupRouterSchema.reorderInput>;
}) {
  console.trace({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'reorderGroup %o', input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace({ input, ...ctx });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN'], user_role });

  // 存在チェック
  const currentList = await GroupRepository.findManyGroup(ctx.prisma, {
    where: {
      space_id: input.space_id, // 入力値の space_id と一致すること
      group_id: {
        in: input.order.map((x) => x.group_id),
      },
    },
    orderBy: { group_order: 'asc' },
  });

  if (currentList.length !== input.order.length) {
    // 入力値の space_id と異なるグループが指定されていたときは、エラーが原因は 'BAD_REQUEST' だが、
    // 不正なリクエストだった場合、そのグループが存在することを示してしまうため、 'NOT_FOUND' のエラーでまとめる。
    throw new HTTPException(StatusCode.NOT_FOUND, {
      message: message.error.NOT_FOUND,
    });
  }

  await SpaceRepository.updateSpace(ctx.prisma, {
    where: {
      space_id: input.space_id,
    },
    operator_id: ctx.operator.user_id,
    data: {
      group_list: {
        update: input.order.map((x) => {
          return {
            data: {
              group_order: x.group_order,
              updated_by: ctx.operator.user_id,
            },
            where: {
              group_id: x.group_id,
            },
          } satisfies Prisma.GroupUpdateWithWhereUniqueWithoutSpaceInput;
        }),
      },
    },
  });

  return { ok: true } as const;
}

// #region Authorization
function generateHasAccessAuthorityWhere(user_id: string) {
  return {
    space: {
      space_user_list: {
        some: {
          user_id,
        },
      },
    },
  } as const satisfies Prisma.GroupWhereInput;
}
// #endregion Authorization
