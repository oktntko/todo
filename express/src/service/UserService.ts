import { Prisma } from '@prisma/client';
import { log } from '~/lib/log4js.js';
import { z } from '~/lib/zod.js';
import { PrismaClient } from '~/middleware/prisma.js';
import { checkDataExist, checkDuplicate, checkPreviousVersion } from '~/repository/_repository.js';
import { UserRepository } from '~/repository/UserRepository.js';
import { UserRouterSchema } from '~/schema/UserRouterSchema.js';

export const UserService = {
  listUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};

// user.list
async function listUser(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof UserRouterSchema.listInput>,
) {
  log.trace(reqid, 'listUser', operator_id, input);

  const where: Prisma.UserWhereInput = {};
  if (input.where.user_keyword) {
    where.OR = [
      { username: { contains: input.where.user_keyword } },
      { email: { contains: input.where.user_keyword } },
    ];
  }
  log.debug(reqid, 'where', where);

  const total = await UserRepository.countUser(prisma, {
    where,
  });
  const user_list = await UserRepository.findManyUser(prisma, {
    where,
    orderBy: { [input.sort.field]: input.sort.order },
    take: input.limit,
    skip: input.offset,
  });

  return {
    total,
    user_list,
  } satisfies z.infer<typeof UserRouterSchema.listOutput>;
}

// user.get
async function getUser(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof UserRouterSchema.getInput>,
) {
  log.trace(reqid, 'getUser', operator_id, input);

  return checkDataExist({
    data: UserRepository.findUniqueUser(prisma, {
      where: { user_id: input.user_id },
    }),
  });
}

// user.create
async function createUser(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof UserRouterSchema.createInput>,
) {
  log.trace(reqid, 'createUser', operator_id, input);

  await checkDuplicate({
    duplicate: UserRepository.findUniqueUser(prisma, {
      where: { email: input.email },
    }),
  });

  return UserRepository.createUser(prisma, {
    data: input,
  });
}

// user.update
async function updateUser(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof UserRouterSchema.updateInput>,
) {
  log.trace(reqid, 'updateUser', operator_id, input);

  await checkPreviousVersion({
    previous: UserRepository.findUniqueUser(prisma, {
      where: { user_id: input.user_id },
    }),
    updated_at: input.updated_at,
  });

  await checkDuplicate({
    duplicate: UserRepository.findUniqueUser(prisma, {
      where: { email: input.email },
    }),
    current: { key: 'user_id', value: input.user_id },
  });

  return UserRepository.updateUser(prisma, {
    data: input,
    where: { user_id: input.user_id },
  });
}

// user.delete
async function deleteUser(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof UserRouterSchema.deleteInput>,
) {
  log.trace(reqid, 'deleteUser', operator_id, input);

  await checkPreviousVersion({
    previous: UserRepository.findUniqueUser(prisma, {
      where: { user_id: input.user_id },
    }),
    updated_at: input.updated_at,
  });

  return UserRepository.deleteUser(prisma, {
    where: { user_id: input.user_id },
  });
}
