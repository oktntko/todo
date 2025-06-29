import type { z } from '-lib/zod';
import type { Prisma, PrismaClient } from '-prisma/client';
import { log } from '~/lib/log4js';
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
async function listSpace(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof SpaceRouterSchema.listInput>,
) {
  log.trace(reqid, 'listSpace', operator_id, input);

  const where: Prisma.SpaceWhereInput = {
    owner_id: operator_id,
  };
  if (input.where.space_keyword) {
    where.OR = [
      { space_name: { contains: input.where.space_keyword } },
      { space_description: { contains: input.where.space_keyword } },
      { todo_list: { some: { title: { contains: input.where.space_keyword } } } },
    ];
  }
  log.debug(reqid, 'where', where);

  const total = await SpaceRepository.countSpace(prisma, {
    where,
  });
  const space_list = await SpaceRepository.findManySpace(prisma, {
    where,
    orderBy: { [input.sort.field]: input.sort.order },
  });

  return {
    total,
    space_list,
  } satisfies z.infer<typeof SpaceRouterSchema.listOutput>;
}

// space.get
async function getSpace(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof SpaceRouterSchema.getInput>,
) {
  log.trace(reqid, 'getSpace', operator_id, input);

  return checkDataExist({
    data: SpaceRepository.findUniqueSpace(prisma, {
      where: { space_id: input.space_id },
    }),
  });
}

// space.create
async function createSpace(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof SpaceRouterSchema.createInput>,
) {
  log.trace(reqid, 'createSpace', operator_id, input);

  const count = await SpaceRepository.countSpace(prisma, {
    where: { owner_id: operator_id },
  });

  return SpaceRepository.createSpace(prisma, {
    data: {
      owner_id: operator_id,
      space_name: input.space_name,
      space_description: input.space_description,
      space_order: count,
      space_image: input.space_image,
      space_color: input.space_color,
    },
    operator_id,
  });
}

// space.update
async function updateSpace(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof SpaceRouterSchema.updateInput>,
) {
  log.trace(reqid, 'updateSpace', operator_id, input);

  const previous = await checkPreviousVersion({
    previous: SpaceRepository.findUniqueSpace(prisma, {
      where: { space_id: input.space_id },
    }),
    updated_at: input.updated_at,
  });

  return SpaceRepository.updateSpace(prisma, {
    where: { space_id: input.space_id },
    data: {
      owner_id: operator_id,
      space_name: input.space_name,
      space_description: input.space_description,
      space_order: previous.space_order,
      space_image: input.space_image,
      space_color: input.space_color,
    },
    operator_id,
  });
}

// space.delete
async function deleteSpace(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof SpaceRouterSchema.deleteInput>,
) {
  log.trace(reqid, 'deleteSpace', operator_id, input);

  await checkPreviousVersion({
    previous: SpaceRepository.findUniqueSpace(prisma, {
      where: { space_id: input.space_id },
    }),
    updated_at: input.updated_at,
  });

  return SpaceRepository.deleteSpace(prisma, {
    where: { space_id: input.space_id },
  });
}

// space.reorder
async function reorderSpace(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof SpaceRouterSchema.reorderInputList>,
) {
  log.trace(reqid, 'reorderSpace', operator_id, input);

  return Promise.all(
    input.map((x) =>
      SpaceRepository.updateSpace(prisma, {
        where: { space_id: x.space_id },
        data: {
          space_order: x.space_order,
        },
        operator_id,
      }),
    ),
  );
}
