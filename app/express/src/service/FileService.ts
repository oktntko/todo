import type { z } from '@todo/lib/zod';
import { type Prisma } from '@todo/prisma/client';
import { TRPCError } from '@trpc/server';
import AdmZip from 'adm-zip';
import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { message } from '~/lib/message';
import { ProtectedContext } from '~/middleware/trpc';
import { checkDataExist, checkPreviousVersion } from '~/repository/_repository';
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

// /api/file/download/single
async function readFile(ctx: ProtectedContext, input: z.infer<typeof FileRouterSchema.getInput>) {
  log.trace(ReqCtx.reqid, 'readFile', ctx.operator.user_id, input);

  // テーブルからデータを取得
  const filedata = await checkDataExist({
    data: FileRepository.findUniqueFile(ctx.prisma, {
      where: { file_id: input.file_id },
    }),
  });

  // ストレージからデータを取得
  const buffer = await FileRepository.readFile(filedata);
  if (buffer == null) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: message.error.NOT_FOUND,
    });
  }

  return { filedata, buffer };
}

// /api/file/download/many
async function readManyFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.getManyInput>,
) {
  log.trace(ReqCtx.reqid, 'readManyFile', ctx.operator.user_id, input);

  const dataList = await Promise.all(
    input.file_id_list.map((file_id) => FileService.readFile(ctx, { file_id })),
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

// /api/file/upload/single
async function createFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.createInput>,
) {
  log.trace(ReqCtx.reqid, 'createFile', ctx.operator.user_id, input);

  const filename = decodeURIComponent(input.file.originalname);

  // テーブルを更新
  const filedata = await FileRepository.createFile(ctx.prisma, ctx.operator.user_id, {
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
          user_id: ctx.operator.user_id,
        },
      },
    },
  });

  // ストレージを更新
  await FileRepository.writeFile(filedata, input.file.buffer);

  return filedata;
}

// /api/file/upload/many
async function createManyFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.createManyInput>,
) {
  log.trace(ReqCtx.reqid, 'createManyFile', ctx.operator.user_id, input);

  return Promise.all(
    input.files.map((file) =>
      FileService.createFile(ctx, {
        file,
        body: { todo_id: input.body.todo_id },
      }),
    ),
  );
}

// file.delete
async function deleteFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteFile', ctx.operator.user_id, input);

  // テーブルを更新
  await checkPreviousVersion({
    previous: FileRepository.findUniqueFile(ctx.prisma, {
      where: { file_id: input.file_id },
    }),
    updated_at: input.updated_at,
  });

  const filedata = await FileRepository.deleteFile(ctx.prisma, {
    where: { file_id: input.file_id },
  });

  // ストレージを更新
  FileRepository.removeFile(filedata);

  return filedata;
}

async function deleteManyFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.deleteInput>[],
) {
  log.trace(ReqCtx.reqid, 'deleteManyFile', ctx.operator.user_id, input);

  return Promise.all(input.map((x) => FileService.deleteFile(ctx, x)));
}

// file.search
async function searchFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.searchInput>,
) {
  log.trace(ReqCtx.reqid, 'searchFile', ctx.operator.user_id, input);

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
    user_list: { some: { user_id: ctx.operator.user_id } },
    AND,
  };
  log.debug(ReqCtx.reqid, 'where', where);

  const orderBy: Prisma.FileOrderByWithRelationInput = { [input.sort.field]: input.sort.order };
  log.debug(ReqCtx.reqid, 'orderBy', orderBy);

  const total = await FileRepository.countFile(ctx.prisma, {
    where,
  });
  const file_list = await FileRepository.findManyFile(ctx.prisma, {
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
