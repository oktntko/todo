import type { z } from '@todo/lib/zod';

import { SpaceUserRole, type Prisma } from '@todo/prisma/client';
import { TRPCError } from '@trpc/server';

import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { message } from '~/lib/message';
import { ProtectedContext } from '~/middleware/trpc';
import { _repository } from '~/repository/_repository';
import { SpaceRepository } from '~/repository/SpaceRepository';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';

export const SpaceService = {
  listSpace,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace,
};

// space.list
async function listSpace(ctx: ProtectedContext) {
  log.trace(ReqCtx.reqid, 'listSpace', ctx.operator.user_id);

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  return SpaceRepository.findManySpace(ctx.prisma, {
    where: {
      ...hasAccessAuthorityWhere,
    },
    orderBy: { updated_at: 'asc' },
  });
}

// space.get
async function getSpace(ctx: ProtectedContext, input: z.infer<typeof SpaceRouterSchema.getInput>) {
  log.trace(ReqCtx.reqid, 'getSpace', ctx.operator.user_id, input);

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  return _repository.checkDataExist({
    data: SpaceRepository.findUniqueSpace(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        space_id: input.space_id,
      },
    }),
  });
}

// space.create
async function createSpace(
  ctx: ProtectedContext,
  input: z.infer<typeof SpaceRouterSchema.createInput>,
) {
  log.trace(ReqCtx.reqid, 'createSpace', ctx.operator.user_id, input);

  return SpaceRepository.createSpace(ctx.prisma, {
    operator_id: ctx.operator.user_id,
    data: {
      ...input,

      space_user_list: {
        create: {
          role: 'OWNER',
          user_id: ctx.operator.user_id,
        },
      },
    },
  });
}

// space.update
async function updateSpace(
  ctx: ProtectedContext,
  input: z.infer<typeof SpaceRouterSchema.updateInput>,
) {
  log.trace(ReqCtx.reqid, 'updateSpace', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const current = await _repository.checkVersion({
    current: SpaceRepository.findUniqueSpace(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        space_id: input.space_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = current.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN'], user_role });

  return SpaceRepository.updateSpace(ctx.prisma, {
    where: { space_id: input.space_id },
    operator_id: ctx.operator.user_id,
    data: input,
  });
}

// space.delete
async function deleteSpace(
  ctx: ProtectedContext,
  input: z.infer<typeof SpaceRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteSpace', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const current = await _repository.checkVersion({
    current: SpaceRepository.findUniqueSpace(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        space_id: input.space_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = current.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER'], user_role });

  await SpaceRepository.deleteSpace(ctx.prisma, {
    where: { space_id: input.space_id },
  });

  return { space_id: input.space_id };
}

// #region Authorization
function generateHasAccessAuthorityWhere(user_id: string) {
  return {
    space_user_list: {
      some: {
        user_id,
      },
    },
  } as const satisfies Prisma.SpaceWhereInput;
}
// #endregion Authorization

export const SpaceAuthorization = {
  checkHasAuthority,
};

function checkHasAuthority(params: {
  need_role: SpaceUserRole[];
  user_role: SpaceUserRole | undefined;
}) {
  if (!params.user_role || !params.need_role.includes(params.user_role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: message.error.FORBIDDEN,
    });
  }
}

// 401 Unauthorized
// authorize 権限を与える、許可する
// 「認証」は英語で Authentication (AuthN)、「認可」は Authorization (AuthZ)
// authority その人が始めから持っている権限 「誰（何）が権限を持っているか（役割や属性）」
// authorization 与えられた権限 「その権限に基づいて何（どこ）までアクセスできるか（できること）」

/**
 * Authority （権限・権威）
 * 意味: ある人や役割、システムが持つ「力」や「権限」、または「権威」そのものを指します。
 * システムでの例: 「一般社員」「管理者」「経理担当者」といったロール（役割）や、ユーザーの属性（年齢、所属部署など）がAuthorityにあたります。
 * Authorization （認可・承認）
 * 意味: 認証されたユーザー（Authority）に対して、特定のシステム、機能、データへのアクセスを「許可する」プロセスや仕組みです。
 * システムでの例: 一般社員は「勤怠入力・休暇申請」のみ可能だが、管理者はそれに加えて「申請の承認」もできる、といった「できること」の範囲を決定します。
 */
