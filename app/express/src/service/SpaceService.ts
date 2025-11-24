import type { z } from '@todo/lib/zod';
import { type Prisma } from '@todo/prisma/client';
import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { ProtectedContext } from '~/middleware/trpc';
import { checkDataExist, checkPreviousVersion } from '~/repository/_repository';
import { SpaceRepository } from '~/repository/SpaceRepository';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';

export const SpaceService = {
  listSpace,
  getSpace,
  createSpace,
  updateSpace,
  deleteSpace,
  reorderSpace,
};

// space.list
async function listSpace(ctx: ProtectedContext) {
  log.trace(ReqCtx.reqid, 'listSpace', ctx.operator.user_id);

  const where: Prisma.SpaceWhereInput = {
    owner_id: ctx.operator.user_id,
  };

  log.debug(ReqCtx.reqid, 'where', where);

  return SpaceRepository.findManySpace(ctx.prisma, {
    where,
    orderBy: { space_order: 'asc' },
  });
}

// space.get
async function getSpace(ctx: ProtectedContext, input: z.infer<typeof SpaceRouterSchema.getInput>) {
  log.trace(ReqCtx.reqid, 'getSpace', ctx.operator.user_id, input);

  return checkDataExist({
    data: SpaceRepository.findUniqueSpace(ctx.prisma, {
      where: { space_id: input.space_id },
    }),
  });
}

// space.create
async function createSpace(
  ctx: ProtectedContext,
  input: z.infer<typeof SpaceRouterSchema.createInput>,
) {
  log.trace(ReqCtx.reqid, 'createSpace', ctx.operator.user_id, input);

  const count = await SpaceRepository.countSpace(ctx.prisma, {
    where: { owner_id: ctx.operator.user_id },
  });

  return SpaceRepository.createSpace(ctx.prisma, {
    data: {
      owner_id: ctx.operator.user_id,
      space_name: input.space_name,
      space_description: input.space_description,
      space_order: count,
      space_image: input.space_image,
      space_color: input.space_color,
    },
    operator_id: ctx.operator.user_id,
  });
}

// space.update
async function updateSpace(
  ctx: ProtectedContext,
  input: z.infer<typeof SpaceRouterSchema.updateInput>,
) {
  log.trace(ReqCtx.reqid, 'updateSpace', ctx.operator.user_id, input);

  const previous = await checkPreviousVersion({
    previous: SpaceRepository.findUniqueSpace(ctx.prisma, {
      where: { space_id: input.space_id },
    }),
    updated_at: input.updated_at,
  });

  return SpaceRepository.updateSpace(ctx.prisma, {
    where: { space_id: input.space_id },
    data: {
      owner_id: ctx.operator.user_id,
      space_name: input.space_name,
      space_description: input.space_description,
      space_order: previous.space_order,
      space_image: input.space_image,
      space_color: input.space_color,
    },
    operator_id: ctx.operator.user_id,
  });
}

// space.delete
async function deleteSpace(
  ctx: ProtectedContext,
  input: z.infer<typeof SpaceRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteSpace', ctx.operator.user_id, input);

  await checkPreviousVersion({
    previous: SpaceRepository.findUniqueSpace(ctx.prisma, {
      where: { space_id: input.space_id },
    }),
    updated_at: input.updated_at,
  });

  return SpaceRepository.deleteSpace(ctx.prisma, {
    where: { space_id: input.space_id },
  });
}

// space.reorder
async function reorderSpace(
  ctx: ProtectedContext,
  input: z.infer<typeof SpaceRouterSchema.reorderInputList>,
) {
  log.trace(ReqCtx.reqid, 'reorderSpace', ctx.operator.user_id, input);

  return Promise.all(
    input.map((x) =>
      SpaceRepository.updateSpace(ctx.prisma, {
        where: { space_id: x.space_id },
        data: {
          space_order: x.space_order,
        },
        operator_id: ctx.operator.user_id,
      }),
    ),
  );
}
