import { type Prisma } from '@todo/prisma/client';
import { type PrismaClient } from '~/middleware/prisma';

export const UserRepository = {
  countUser,
  findManyUser,
  findUniqueUser,
  createUser,
  updateUser,
  deleteUser,
};

async function countUser(
  prisma: PrismaClient,
  params: {
    where: Prisma.UserWhereInput;
  },
) {
  return prisma.user.count({
    where: params.where,
  });
}

async function findManyUser(
  prisma: PrismaClient,
  params: {
    where: Prisma.UserWhereInput;
    orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    take?: number;
    skip?: number;
  },
) {
  return prisma.user.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueUser(
  prisma: PrismaClient,
  params: {
    where: Prisma.UserWhereUniqueInput;
  },
) {
  return prisma.user.findUnique({
    where: params.where,
  });
}

async function createUser(
  prisma: PrismaClient,
  params: {
    data: Omit<Prisma.UserUncheckedCreateInput, CommonColumn>;
  },
) {
  return prisma.user.create({
    data: {
      email: params.data.email,
      password: params.data.password,
      username: params.data.username,
      avatar_image: params.data.avatar_image,
      description: params.data.description,
      twofa_enable: params.data.twofa_enable,
      twofa_secret: params.data.twofa_secret,
      aichat_enable: params.data.aichat_enable,
      aichat_model: params.data.aichat_model,
      aichat_api_key: params.data.aichat_api_key,

      session_list: params.data.session_list,
      file_list: params.data.file_list,
    },
  });
}

async function updateUser(
  prisma: PrismaClient,
  params: {
    where: Prisma.UserWhereUniqueInput;
    data: Omit<Prisma.UserUncheckedUpdateInput, CommonColumn>;
  },
) {
  return prisma.user.update({
    data: {
      email: params.data.email,
      password: params.data.password,
      username: params.data.username,
      avatar_image: params.data.avatar_image,
      description: params.data.description,
      twofa_enable: params.data.twofa_enable,
      twofa_secret: params.data.twofa_secret,
      aichat_enable: params.data.aichat_enable,
      aichat_model: params.data.aichat_model,
      aichat_api_key: params.data.aichat_api_key,

      session_list: params.data.session_list,
      file_list: params.data.file_list,
    },
    where: params.where,
  });
}

async function deleteUser(
  prisma: PrismaClient,
  params: {
    where: Prisma.UserWhereUniqueInput;
  },
) {
  return prisma.user.delete({
    where: params.where,
  });
}
