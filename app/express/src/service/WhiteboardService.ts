import type { z } from '@todo/lib/zod';

import { type Prisma } from '@todo/prisma/client';
import { TRPCError } from '@trpc/server';

import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { message } from '~/lib/message';
import { ProtectedContext } from '~/middleware/trpc';
import { _repository } from '~/repository/_repository';
import { SpaceRepository } from '~/repository/SpaceRepository';
import { WhiteboardRepository } from '~/repository/WhiteboardRepository';
import { WhiteboardRouterSchema } from '~/schema/WhiteboardRouterSchema';

import { SpaceAuthorization, SpaceService } from './SpaceService';

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
async function listWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.listInput>,
) {
  log.trace(ReqCtx.reqid, 'listWhiteboard', ctx.operator.user_id);

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
async function getWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.getInput>,
) {
  log.trace(ReqCtx.reqid, 'getWhiteboard', ctx.operator.user_id, input);

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
async function createWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.createInput>,
) {
  log.trace(ReqCtx.reqid, 'createWhiteboard', ctx.operator.user_id, input);
  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace(ctx, input);

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
async function updateWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.updateInput>,
) {
  log.trace(ReqCtx.reqid, 'updateWhiteboard', ctx.operator.user_id, input);

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
async function applyChangeWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.applyChangeInput>,
) {
  log.trace(ReqCtx.reqid, 'applyChangeWhiteboard', ctx.operator.user_id, input);

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
async function deleteWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteWhiteboard', ctx.operator.user_id, input);

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
async function reorderWhiteboard(
  ctx: ProtectedContext,
  input: z.infer<typeof WhiteboardRouterSchema.reorderInput>,
) {
  log.trace(ReqCtx.reqid, 'reorderWhiteboard', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace(ctx, input);

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
    throw new TRPCError({
      code: 'NOT_FOUND',
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
