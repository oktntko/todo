import type { z } from '@todo/lib/zod';

import { type Prisma } from '@todo/prisma/client';
import { TRPCError } from '@trpc/server';
import AdmZip from 'adm-zip';

import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { message } from '~/lib/message';
import { ProtectedContext } from '~/middleware/trpc';
import { _repository } from '~/repository/_repository';
import { FileRepository } from '~/repository/FileRepository';
import { TodoRepository } from '~/repository/TodoRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

import { SpaceAuthorization, SpaceService } from './SpaceService';

export const FileService = {
  searchFile,
  readFile,
  readManyFile,
  createFile,
  createManyFile,
  deleteFile,
  deleteManyFile,
};

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

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const where: Prisma.FileWhereInput = {
    ...hasAccessAuthorityWhere,
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

// /api/file/download/single
async function readFile(ctx: ProtectedContext, input: z.infer<typeof FileRouterSchema.getInput>) {
  log.trace(ReqCtx.reqid, 'readFile', ctx.operator.user_id, input);

  // テーブルからデータを取得する
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const filedata = await _repository.checkDataExist({
    data: FileRepository.findUniqueFile(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        file_id: input.file_id,
      },
    }),
  });

  // ストレージからデータを取得する
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

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace(ctx, input.body);

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  if (input.body.todo_id != null) {
    await _repository.checkDataExist({
      data: TodoRepository.findUniqueTodo(ctx.prisma, {
        operator_id: ctx.operator.user_id,
        where: {
          group: { space_id: input.body.space_id }, // 入力値の space_id と一致すること
          todo_id: input.body.todo_id, // 存在すること
        },
      }),
    });
  }

  // テーブルにデータを保存する
  const filedata = await FileRepository.createFile(ctx.prisma, ctx.operator.user_id, {
    data: {
      space_id: input.body.space_id,
      filename: decodeURIComponent(input.file.originalname),
      mimetype: input.file.mimetype,
      filesize: input.file.size,

      todo_list: input.body.todo_id ? { connect: { todo_id: input.body.todo_id } } : undefined,
    },
  });

  // ストレージにデータを保存する
  await FileRepository.writeFile(filedata, input.file.buffer);

  return filedata;
}

// /api/file/upload/many
async function createManyFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.createManyInput>,
) {
  log.trace(ReqCtx.reqid, 'createManyFile', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace(ctx, input.body);

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  if (input.body.todo_id != null) {
    await _repository.checkDataExist({
      data: TodoRepository.findUniqueTodo(ctx.prisma, {
        operator_id: ctx.operator.user_id,
        where: {
          group: { space_id: input.body.space_id }, // 入力値の space_id と一致すること
          todo_id: input.body.todo_id, // 存在すること
        },
      }),
    });
  }

  // テーブルにデータを保存する
  const dataList = await Promise.all(
    input.files.map(async (file) => {
      const filedata = await FileRepository.createFile(ctx.prisma, ctx.operator.user_id, {
        data: {
          space_id: input.body.space_id,
          filename: decodeURIComponent(file.originalname),
          mimetype: file.mimetype,
          filesize: file.size,

          todo_list: input.body.todo_id ? { connect: { todo_id: input.body.todo_id } } : undefined,
        },
      });

      return { filedata, buffer: file.buffer };
    }),
  );

  // ストレージにデータを保存する
  // ストレージは rollback できないので、テーブル → ストレージで処理を分ける
  for (const data of dataList) {
    await FileRepository.writeFile(data.filedata, data.buffer);
  }

  return dataList.map((x) => x.filedata);
}

// file.delete
async function deleteFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteFile', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkVersion({
    current: FileRepository.findUniqueFile(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        file_id: input.file_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  // テーブルのデータを削除する
  const filedata = await FileRepository.deleteFile(ctx.prisma, {
    where: { file_id: input.file_id },
  });

  // ストレージのデータを削除する
  FileRepository.removeFile(filedata);

  return { file_id: input.file_id };
}

// file.deleteMany
async function deleteManyFile(
  ctx: ProtectedContext,
  input: z.infer<typeof FileRouterSchema.deleteManyInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteManyFile', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace(ctx, input);

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  // 権限チェック、存在チェック、排他チェック
  const currentList = await FileRepository.findManyFile(ctx.prisma, {
    where: {
      space_id: input.space_id, // 入力値の space_id と一致すること
      file_id: {
        in: input.target_list.map((x) => x.file_id),
      },
    },
    orderBy: { file_id: 'asc' },
  });

  for (const target of input.target_list) {
    const current = currentList.find((x) => x.file_id === target.file_id);
    if (current == null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    }

    if (current.updated_at.getTime() !== target.updated_at.getTime()) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: message.error.CONFLICT_CURRENT_UPDATED,
      });
    }
  }

  // テーブルのデータを削除する
  await FileRepository.deleteManyFile(ctx.prisma, {
    where: {
      file_id: {
        in: input.target_list.map((x) => x.file_id),
      },
    },
  });

  // ストレージのデータを削除する
  // ストレージは rollback できないので、テーブル → ストレージで処理を分ける
  input.target_list.forEach(FileRepository.removeFile);

  return { ok: true } as const;
}

// #region Authorization
function generateHasAccessAuthorityWhere(user_id: string) {
  return {
    space: {
      space_user_list: {
        some: {
          user_id,
        },
      },
    },
  } as const satisfies Prisma.FileWhereInput;
}
// #endregion Authorization
