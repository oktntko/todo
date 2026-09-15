import type { z } from '@todo/lib';

import { type Prisma } from '@todo/prisma/client';
import AdmZip from 'adm-zip';
import { HTTPException } from 'hono/http-exception';

import type { OperatorMinimum } from '@/middleware/auth';
import type { PrismaClient } from '@/middleware/prisma';

import { ReqCtx } from '@/lib/context';
import { message } from '@/lib/message';
import { StatusCode } from '@/middleware/hono';
import { _repository } from '@/repository/_repository';
import { FileRepository } from '@/repository/FileRepository';
import { TodoRepository } from '@/repository/TodoRepository';
import { FileRouterSchema } from '@/schema/FileRouterSchema';
import { SpaceAuthorization, SpaceService } from '@/service/SpaceService';

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
async function searchFile({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof FileRouterSchema.searchInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid }, 'searchFile', input);

  const AND: Prisma.FileWhereInput[] = [];

  AND.push({
    space_id: input.space_id,
  });

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
  console.debug({ reqid: ReqCtx.reqid, where }, 'where');

  const orderBy: Prisma.FileOrderByWithRelationInput = { [input.sort.field]: input.sort.order };
  console.debug({ reqid: ReqCtx.reqid, orderBy }, 'orderBy');

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
async function readFile({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof FileRouterSchema.getInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'readFile', input);

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
    throw new HTTPException(StatusCode.NOT_FOUND, {
      message: message.error.NOT_FOUND,
    });
  }

  return { filedata, buffer };
}

// /api/file/download/many
async function readManyFile({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof FileRouterSchema.getManyInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'readManyFile', input);

  const dataList = await Promise.all(
    input.file_id_list.map((file_id) => FileService.readFile({ ...ctx, input: { file_id } })),
  );

  const zip = new AdmZip();
  dataList.forEach(({ filedata, buffer }) => {
    zip.addFile(filedata.filename, buffer);
  });

  return {
    filedata: { filename: 'download.zip', mimetype: 'application/zip' },
    buffer: Buffer.from(zip.toBuffer()),
  };
}

// /api/file/upload/single
async function createFile({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof FileRouterSchema.createInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'createFile', input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace({ ...ctx, input });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  if (input.todo_id != null) {
    await _repository.checkDataExist({
      data: TodoRepository.findUniqueTodo(ctx.prisma, {
        operator_id: ctx.operator.user_id,
        where: {
          group: { space_id: input.space_id }, // 入力値の space_id と一致すること
          todo_id: input.todo_id, // 存在すること
        },
      }),
    });
  }

  // テーブルにデータを保存する
  const filedata = await FileRepository.createFile(ctx.prisma, ctx.operator.user_id, {
    data: {
      space_id: input.space_id,
      filename: input.file.name,
      mimetype: input.file.type,
      filesize: input.file.size,

      todo_list: input.todo_id ? { connect: { todo_id: input.todo_id } } : undefined,
    },
  });

  // ストレージにデータを保存する
  await FileRepository.writeFile(filedata, Buffer.from(await input.file.arrayBuffer()));

  return filedata;
}

// /api/file/upload/many
async function createManyFile({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof FileRouterSchema.createManyInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'createManyFile', input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace({ ...ctx, input });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  if (input.todo_id != null) {
    await _repository.checkDataExist({
      data: TodoRepository.findUniqueTodo(ctx.prisma, {
        operator_id: ctx.operator.user_id,
        where: {
          group: { space_id: input.space_id }, // 入力値の space_id と一致すること
          todo_id: input.todo_id, // 存在すること
        },
      }),
    });
  }

  // テーブルにデータを保存する
  const dataList = await Promise.all(
    input.files.map(async (file) => {
      const filedata = await FileRepository.createFile(ctx.prisma, ctx.operator.user_id, {
        data: {
          space_id: input.space_id,
          filename: file.name,
          mimetype: file.type,
          filesize: file.size,

          todo_list: input.todo_id ? { connect: { todo_id: input.todo_id } } : undefined,
        },
      });

      return { filedata, buffer: Buffer.from(await file.arrayBuffer()) };
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
async function deleteFile({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof FileRouterSchema.deleteInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'deleteFile', input);

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
async function deleteManyFile({
  input,
  ...ctx
}: {
  prisma: PrismaClient;
  operator: OperatorMinimum;
  input: z.infer<typeof FileRouterSchema.deleteManyInput>;
}) {
  console.debug({ reqid: ReqCtx.reqid, user_id: ctx.operator.user_id }, 'deleteManyFile', input);

  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace({ ...ctx, input });

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
      throw new HTTPException(StatusCode.NOT_FOUND, {
        message: message.error.NOT_FOUND,
      });
    }

    if (current.updated_at.getTime() !== target.updated_at.getTime()) {
      throw new HTTPException(StatusCode.CONFLICT, {
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
