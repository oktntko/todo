import { Prisma } from '@prisma/client';
import { log } from '~/lib/log4js.js';
import { z } from '~/lib/zod.js';
import { PrismaClient } from '~/middleware/prisma.js';
import { checkDataExist, checkPreviousVersion } from '~/repository/_repository.js';
import { TagRepository } from '~/repository/TagRepository.js';
import { TagRouterSchema } from '~/schema/TagRouterSchema.js';

export const TagService = {
  listTag,
  getTag,
  createTag,
  updateTag,
  deleteTag,
};

// tag.list
async function listTag(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TagRouterSchema.listInput>,
) {
  log.trace(reqid, 'listTag', operator_id, input);

  const where: Prisma.TagWhereInput = {
    owner_id: operator_id,
  };
  if (input.where.space_id) {
    where.AND = [{ space_list: { some: { space_id: { in: input.where.space_id } } } }];
  }
  if (input.where.tag_keyword) {
    where.tag_name = { contains: input.where.tag_keyword };
  }

  log.debug(reqid, 'where', where);

  const total = await TagRepository.countTag(prisma, {
    where,
  });
  const tag_list = await TagRepository.findManyTag(prisma, {
    where,
    orderBy: { [input.sort.field]: input.sort.order },
  });

  return {
    total,
    tag_list,
  } satisfies z.infer<typeof TagRouterSchema.listOutput>;
}

// tag.get
async function getTag(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TagRouterSchema.getInput>,
) {
  log.trace(reqid, 'getTag', operator_id, input);

  return checkDataExist({
    data: TagRepository.findUniqueTag(prisma, {
      where: { tag_id: input.tag_id },
    }),
  });
}

// tag.create
async function createTag(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TagRouterSchema.createInput>,
) {
  log.trace(reqid, 'createTag', operator_id, input);

  const count = await TagRepository.countTag(prisma, {
    where: { owner_id: operator_id },
  });

  return TagRepository.createTag(prisma, {
    data: {
      owner_id: operator_id,
      tag_name: input.tag_name,
      tag_order: count,
      tag_color: input.tag_color,
    },
    operator_id,
  });
}

// tag.update
async function updateTag(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TagRouterSchema.updateInput>,
) {
  log.trace(reqid, 'updateTag', operator_id, input);

  const previous = await checkPreviousVersion({
    previous: TagRepository.findUniqueTag(prisma, {
      where: { tag_id: input.tag_id },
    }),
    updated_at: input.updated_at,
  });

  return TagRepository.updateTag(prisma, {
    where: { tag_id: input.tag_id },
    data: {
      owner_id: operator_id,
      tag_name: input.tag_name,
      tag_description: input.tag_description,
      tag_order: previous.tag_order,
      tag_color: input.tag_color,
    },
    operator_id,
  });
}

// tag.delete
async function deleteTag(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof TagRouterSchema.deleteInput>,
) {
  log.trace(reqid, 'deleteTag', operator_id, input);

  await checkPreviousVersion({
    previous: TagRepository.findUniqueTag(prisma, {
      where: { tag_id: input.tag_id },
    }),
    updated_at: input.updated_at,
  });

  return TagRepository.deleteTag(prisma, {
    where: { tag_id: input.tag_id },
  });
}
