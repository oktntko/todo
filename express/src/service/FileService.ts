import { TRPCError } from '@trpc/server';
import AdmZip from 'adm-zip';
import type { z } from 'zod';
import { log } from '~/lib/log4js.js';
import type { PrismaClient } from '~/middleware/prisma.js';
import {
  checkDataExist,
  checkPreviousVersion,
  MESSAGE_DATA_IS_NOT_EXIST,
} from '~/repository/_repository.js';
import { FileRepository } from '~/repository/FileRepository.js';
import { FileRouterSchema } from '~/schema/FileRouterSchema.js';

export const FileService = {
  readFile,
  readManyFile,
  createFile,
  createManyFile,
  deleteFile,
  deleteManyFile,
};

// # /api/file/download/single
async function readFile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof FileRouterSchema.getInput>,
) {
  log.trace(reqid, 'readFile', operator_id, input);

  // テーブルからデータを取得
  const filedata = await checkDataExist({
    data: FileRepository.findUniqueFile(prisma, {
      where: { file_id: input.file_id },
    }),
  });

  // ストレージからデータを取得
  const buffer = await FileRepository.readFile(filedata);
  if (buffer == null) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: MESSAGE_DATA_IS_NOT_EXIST,
    });
  }

  return { filedata, buffer };
}

// # /api/file/download/many
async function readManyFile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof FileRouterSchema.getManyInput>,
) {
  log.trace(reqid, 'readManyFile', operator_id, input);

  const dataList = await Promise.all(
    input.file_id.map((x) => FileService.readFile(reqid, prisma, operator_id, { file_id: x })),
  );

  const zip = new AdmZip();
  dataList.forEach(({ filedata, buffer }) => {
    zip.addFile(filedata.filename, buffer);
  });

  return {
    filedata: { filename: 'download.zip', mimetype: 'application/zip' },
    buffer: zip.toBuffer(),
  };
}

// # /api/file/upload/single
async function createFile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  file: Express.Multer.File,
) {
  log.trace(reqid, 'createFile', operator_id, file);

  const filename = decodeURIComponent(file.originalname);

  // テーブルを更新
  const filedata = await FileRepository.createFile(prisma, operator_id, {
    data: { filename, mimetype: file.mimetype, size: file.size },
  });

  // ストレージを更新
  await FileRepository.writeFile(filedata, file.buffer);

  return filedata;
}

// # /api/file/upload/many
async function createManyFile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  files: Express.Multer.File[],
) {
  log.trace(reqid, 'createManyFile', operator_id, files);

  return Promise.all(files.map((x) => FileService.createFile(reqid, prisma, operator_id, x)));
}

// # file.delete
async function deleteFile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof FileRouterSchema.deleteInput>,
) {
  log.trace(reqid, 'deleteFile', operator_id, input);

  // テーブルを更新
  await checkPreviousVersion({
    previous: FileRepository.findUniqueFile(prisma, {
      where: { file_id: input.file_id },
    }),
    updated_at: input.updated_at,
  });

  const filedata = await FileRepository.deleteFile(prisma, {
    where: { file_id: input.file_id },
  });

  // ストレージを更新
  FileRepository.removeFile(filedata);

  return filedata;
}

async function deleteManyFile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof FileRouterSchema.deleteInput>[],
) {
  log.trace(reqid, 'deleteManyFile', operator_id, input);

  return Promise.all(input.map((x) => FileService.deleteFile(reqid, prisma, operator_id, x)));
}
