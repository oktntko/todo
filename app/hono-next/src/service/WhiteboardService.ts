import type { z } from '@todo/lib';
import { type Prisma } from '@todo/prisma/client';
import { HTTPException } from 'hono/http-exception';

import { ReqCtx } from '~/lib/context';
import { message } from '~/lib/message';
import type { OperatorMinimum } from '~/middleware/auth';
import { StatusCode } from '~/middleware/hono';
import type { PrismaClient } from '~/middleware/prisma';
import { _repository } from '~/repository/_repository';
import { SpaceRepository } from '~/repository/SpaceRepository';
import { WhiteboardRepository } from '~/repository/WhiteboardRepository';
import { WhiteboardRouterSchema } from '~/schema';
import { SpaceAuthorization, SpaceService } from '~/service/SpaceService';

export const WhiteboardService = {
  listWhiteboard,
  getWhiteboard,
  createWhiteboard,
  updateWhiteboard,
  deleteWhiteboard,
  applyChangeWhiteboard,
  reorderWhiteboard,
};

// whiteboard.list
async function listWhiteboard({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof WhiteboardRouterSchema.listInput>;
}) {
  console.info({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'listWhiteboard %o', input);

  const AND: Prisma.WhiteboardWhereInput[] = [];
  AND.push({ space_id: input.space_id });

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const where: Prisma.WhiteboardWhereInput = {
    ...hasAccessAuthorityWhere,
    AND,
  };

  return WhiteboardRepository.findManyWhiteboard(ctx.prisma, {
    where,
    orderBy: { whiteboard_order: 'asc' },
  });
}

// whiteboard.get
async function getWhiteboard({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof WhiteboardRouterSchema.getInput>;
}) {
  console.info({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'getWhiteboard %o', input);

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  return _repository.checkDataExist({
    data: WhiteboardRepository.findUniqueWhiteboard(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        whiteboard_id: input.whiteboard_id,
      },
    }),
  });
}

// whiteboard.create
async function createWhiteboard({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof WhiteboardRouterSchema.createInput>;
}) {
  console.info(
    { reqid: ReqCtx.reqid, user_id: ctx.operator.user_id },
    'createWhiteboard %o',
    input,
  );
  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace({ ...ctx, input });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  const count = await WhiteboardRepository.countWhiteboard(ctx.prisma, {
    where: { space_id: input.space_id },
  });

  return WhiteboardRepository.createWhiteboard(ctx.prisma, {
    operator_id: ctx.operator.user_id,
    data: {
      ...input,
      whiteboard_order: count,
    },
  });
}

// whiteboard.update
async function updateWhiteboard({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof WhiteboardRouterSchema.updateInput>;
}) {
  console.info(
    { reqid: ReqCtx.reqid, user_id: ctx.operator.user_id },
    'updateWhiteboard %o',
    input,
  );

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkVersion({
    current: WhiteboardRepository.findUniqueWhiteboard(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        whiteboard_id: input.whiteboard_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  return WhiteboardRepository.updateWhiteboard(ctx.prisma, {
    where: {
      whiteboard_id: input.whiteboard_id,
    },
    operator_id: ctx.operator.user_id,
    data: input,
  });
}

// whiteboard.applyChange
async function applyChangeWhiteboard({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof WhiteboardRouterSchema.applyChangeInput>;
}) {
  console.info(
    { reqid: ReqCtx.reqid, user_id: ctx.operator.user_id },
    'applyChangeWhiteboard %o',
    input,
  );

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkDataExist({
    data: WhiteboardRepository.findUniqueWhiteboard(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        whiteboard_id: input.whiteboard_id,
      },
    }),
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  return WhiteboardRepository.updateWhiteboard(ctx.prisma, {
    where: {
      whiteboard_id: input.whiteboard_id,
    },
    operator_id: ctx.operator.user_id,
    data: input,
  });
}

// whiteboard.delete
async function deleteWhiteboard({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof WhiteboardRouterSchema.deleteInput>;
}) {
  console.info(
    { reqid: ReqCtx.reqid, user_id: ctx.operator.user_id },
    'deleteWhiteboard %o',
    input,
  );

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkVersion({
    current: WhiteboardRepository.findUniqueWhiteboard(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        whiteboard_id: input.whiteboard_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  await WhiteboardRepository.deleteWhiteboard(ctx.prisma, {
    where: { whiteboard_id: input.whiteboard_id },
  });

  return { whiteboard_id: input.whiteboard_id };
}

// whiteboard.reorder
async function reorderWhiteboard({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof WhiteboardRouterSchema.reorderInput>;
}) {
  console.info(
    { reqid: ReqCtx.reqid, user_id: ctx.operator.user_id },
    'reorderWhiteboard %o',
    input,
  );

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace({ ...ctx, input });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  // 存在チェック
  const currentList = await WhiteboardRepository.findManyWhiteboard(ctx.prisma, {
    where: {
      space_id: input.space_id, // 入力値の space_id と一致すること
      whiteboard_id: {
        in: input.order.map((x) => x.whiteboard_id),
      },
    },
    orderBy: { whiteboard_order: 'asc' },
  });

  if (currentList.length !== input.order.length) {
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
      whiteboard_list: {
        update: input.order.map((x) => {
          return {
            data: {
              whiteboard_order: x.whiteboard_order,
              updated_by: ctx.operator.user_id,
            },
            where: {
              whiteboard_id: x.whiteboard_id,
            },
          } satisfies Prisma.WhiteboardUpdateWithWhereUniqueWithoutSpaceInput;
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
