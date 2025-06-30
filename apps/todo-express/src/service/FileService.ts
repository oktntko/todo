import type { z } from '@todo/lib/zod';
import { type Prisma } from '@todo/prisma/client';
import { TRPCError } from '@trpc/server';
import AdmZip from 'adm-zip';
import { log } from '~/lib/log4js';
import { type PrismaClient } from '~/middleware/prisma';
import {
  checkDataExist,
  checkPreviousVersion,
  MESSAGE_DATA_IS_NOT_EXIST,
} from '~/repository/_repository';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

export const FileService = {
  readFile,
  readManyFile,
  createFile,
  createManyFile,
  deleteFile,
  deleteManyFile,
  searchFile,
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
    input.file_id_list.map((file_id) =>
      FileService.readFile(reqid, prisma, operator_id, { file_id }),
    ),
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
  input: z.infer<typeof FileRouterSchema.createInput>,
) {
  log.trace(reqid, 'createFile', operator_id, input);

  const filename = decodeURIComponent(input.file.originalname);

  // テーブルを更新
  const filedata = await FileRepository.createFile(prisma, operator_id, {
    data: {
      filename,
      mimetype: input.file.mimetype,
      filesize: input.file.size,

      todo_list: input.body.todo_id
        ? {
            connect: {
              todo_id: input.body.todo_id,
            },
          }
        : undefined,
      user_list: {
        connect: {
          user_id: operator_id,
        },
      },
    },
  });

  // ストレージを更新
  await FileRepository.writeFile(filedata, input.file.buffer);

  return filedata;
}

// # /api/file/upload/many
async function createManyFile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof FileRouterSchema.createManyInput>,
) {
  log.trace(reqid, 'createManyFile', operator_id, input);

  return Promise.all(
    input.files.map((file) =>
      FileService.createFile(reqid, prisma, operator_id, {
        file,
        body: { todo_id: input.body.todo_id },
      }),
    ),
  );
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

// file.search
async function searchFile(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof FileRouterSchema.searchInput>,
) {
  log.trace(reqid, 'searchFile', operator_id, input);

  const AND: Prisma.FileWhereInput[] = [];

  if (input.where.file_keyword) {
    AND.push({
      OR: [
        { filename: { contains: input.where.file_keyword } },
        { todo_list: { some: { title: { contains: input.where.file_keyword } } } },
      ],
    });
  }

  const where: Prisma.FileWhereInput = {
    user_list: { some: { user_id: operator_id } },
    AND,
  };
  log.debug(reqid, 'where', where);

  const orderBy: Prisma.FileOrderByWithRelationInput = { [input.sort.field]: input.sort.order };
  log.debug(reqid, 'orderBy', orderBy);

  const total = await FileRepository.countFile(prisma, {
    where,
  });
  const file_list = await FileRepository.findManyFile(prisma, {
    where,
    orderBy,
    take: input.limit,
    skip: input.limit * (input.page - 1),
  });

  return {
    total,
    file_list,
  } satisfies z.infer<typeof FileRouterSchema.searchOutput>;
}
