import type { z } from '@todo/lib/zod';
import { type Prisma } from '@todo/prisma/client';
import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { ProtectedContext } from '~/middleware/trpc';
import { _repository } from '~/repository/_repository';
import { GroupRepository } from '~/repository/GroupRepository';
import { GroupRouterSchema } from '~/schema/GroupRouterSchema';

export const GroupService = {
  listGroup,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  reorderGroup,
};

// group.list
async function listGroup(ctx: ProtectedContext) {
  log.trace(ReqCtx.reqid, 'listGroup', ctx.operator.user_id);

  const where: Prisma.GroupWhereInput = {
    owner_id: ctx.operator.user_id,
  };

  log.debug(ReqCtx.reqid, 'where', where);

  return GroupRepository.findManyGroup(ctx.prisma, {
    where,
    orderBy: { group_order: 'asc' },
  });
}

// group.get
async function getGroup(ctx: ProtectedContext, input: z.infer<typeof GroupRouterSchema.getInput>) {
  log.trace(ReqCtx.reqid, 'getGroup', ctx.operator.user_id, input);

  return _repository.checkDataExist({
    data: GroupRepository.findUniqueGroup(ctx.prisma, {
      where: { group_id: input.group_id },
    }),
  });
}

// group.create
async function createGroup(
  ctx: ProtectedContext,
  input: z.infer<typeof GroupRouterSchema.createInput>,
) {
  log.trace(ReqCtx.reqid, 'createGroup', ctx.operator.user_id, input);

  const count = await GroupRepository.countGroup(ctx.prisma, {
    where: { owner_id: ctx.operator.user_id },
  });

  return GroupRepository.createGroup(ctx.prisma, {
    data: {
      ...input,
      owner_id: ctx.operator.user_id,
      group_order: count,
    },
    operator_id: ctx.operator.user_id,
  });
}

// group.update
async function updateGroup(
  ctx: ProtectedContext,
  input: z.infer<typeof GroupRouterSchema.updateInput>,
) {
  log.trace(ReqCtx.reqid, 'updateGroup', ctx.operator.user_id, input);

  await _repository.checkPreviousVersion({
    previous: GroupRepository.findUniqueGroup(ctx.prisma, {
      where: { group_id: input.group_id },
    }),
    updated_at: input.updated_at,
  });

  return GroupRepository.updateGroup(ctx.prisma, {
    where: { group_id: input.group_id },
    data: input,
    operator_id: ctx.operator.user_id,
  });
}

// group.delete
async function deleteGroup(
  ctx: ProtectedContext,
  input: z.infer<typeof GroupRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteGroup', ctx.operator.user_id, input);

  await _repository.checkPreviousVersion({
    previous: GroupRepository.findUniqueGroup(ctx.prisma, {
      where: { group_id: input.group_id },
    }),
    updated_at: input.updated_at,
  });

  await GroupRepository.deleteGroup(ctx.prisma, {
    where: { group_id: input.group_id },
  });

  return { group_id: input.group_id };
}

// group.reorder
async function reorderGroup(
  ctx: ProtectedContext,
  input: z.infer<typeof GroupRouterSchema.reorderInputList>,
) {
  log.trace(ReqCtx.reqid, 'reorderGroup', ctx.operator.user_id, input);

  for (const x of input) {
    await GroupRepository.updateGroup(ctx.prisma, {
      where: { group_id: x.group_id },
      data: {
        group_order: x.group_order,
      },
      operator_id: ctx.operator.user_id,
    });
  }

  return { ok: true } as const;
}
