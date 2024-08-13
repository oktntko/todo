import { Prisma } from '@prisma/client';
import { PrismaClient } from '~/middleware/prisma.js';

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
    orderBy: Prisma.UserOrderByWithRelationInput;
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
  params: { data: Omit<Prisma.UserCreateInput, CommonColumn | 'session_list' | 'file_list'> },
) {
  return prisma.user.create({
    data: {
      email: params.data.email,
      password: params.data.password,
      username: params.data.username,
      description: params.data.description,
    },
  });
}

async function updateUser(
  prisma: PrismaClient,
  params: {
    where: RequireOne<Pick<Prisma.UserWhereUniqueInput, 'user_id' | 'email'>>;
    data: Omit<Prisma.UserCreateInput, CommonColumn | 'session_list' | 'file_list'>;
  },
) {
  return prisma.user.update({
    data: {
      email: params.data.email,
      password: params.data.password,
      username: params.data.username,
      description: params.data.description,
    },
    where: params.where,
  });
}

async function deleteUser(
  prisma: PrismaClient,
  params: {
    where: RequireOne<Pick<Prisma.UserWhereUniqueInput, 'user_id' | 'email'>>;
  },
) {
  return prisma.user.delete({
    where: params.where,
  });
}
