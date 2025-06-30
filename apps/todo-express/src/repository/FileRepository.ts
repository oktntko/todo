import { type Prisma, PrismaClient } from '@todo/prisma/client';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { cwd } from 'process';
import { log } from '~/lib/log4js';

export const FileRepository = {
  // database
  countFile,
  findManyFile,
  findUniqueFile,
  createFile,
  deleteFile,
  // file system
  readFile,
  writeFile,
  removeFile,
};

////////////////////////////////////////////////
// database
////////////////////////////////////////////////
async function countFile(
  prisma: PrismaClient,
  params: {
    where: Prisma.FileWhereInput;
  },
) {
  return prisma.file.count({
    where: params.where,
  });
}

async function findManyFile(
  prisma: PrismaClient,
  params: {
    where: Prisma.FileWhereInput;
    orderBy: Prisma.FileOrderByWithRelationInput;
    take?: number;
    skip?: number;
  },
) {
  return prisma.file.findMany({
    include: {
      todo_list: { orderBy: { created_at: 'asc' } },
    },
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
  });
}

async function findUniqueFile(
  prisma: PrismaClient,
  params: {
    where: Prisma.FileWhereUniqueInput;
  },
) {
  return prisma.file.findUnique({
    where: params.where,
  });
}

async function createFile(
  prisma: PrismaClient,
  operator_id: number,
  params: { data: Omit<Prisma.FileUncheckedCreateInput, CommonColumn> },
) {
  return prisma.file.create({
    data: {
      filename: params.data.filename,
      mimetype: params.data.mimetype,
      filesize: params.data.filesize,

      todo_list: params.data.todo_list,
      user_list: params.data.user_list,

      created_by: operator_id,
      updated_by: operator_id,
    },
  });
}

async function deleteFile(
  prisma: PrismaClient,
  params: {
    where: Prisma.FileWhereUniqueInput;
  },
) {
  return prisma.file.delete({
    where: params.where,
  });
}

////////////////////////////////////////////////
// file system
////////////////////////////////////////////////
const STORAGE = `${cwd()}/.userstorage`;

async function readFile(params: { file_id: string; filename: string }) {
  log.debug('readFile', params);

  const filepath = path.resolve(STORAGE, params.file_id, params.filename);

  return fs.existsSync(filepath) ? fsPromises.readFile(filepath) : null;
}

async function writeFile(params: { file_id: string; filename: string }, buffer: Buffer) {
  log.debug('writeFile', params);

  const dirpath = path.resolve(STORAGE, params.file_id);
  fs.rmSync(dirpath, { recursive: true, force: true });
  fs.mkdirSync(dirpath, { recursive: true });

  const filepath = path.join(dirpath, params.filename);
  return fsPromises.writeFile(filepath, buffer);
}

function removeFile(params: { file_id: string; filename: string }) {
  log.debug('removeFile', params);

  const dirpath = path.resolve(STORAGE, params.file_id);

  if (fs.existsSync(dirpath)) {
    fs.rmSync(dirpath, { recursive: true, force: true });
  }
}
