import { R } from '@todo/lib/remeda';
import { TRPCError } from '@trpc/server';
import { message } from '~/lib/message';

export const _repository = {
  checkDataExist,
  checkDuplicate,
  checkPreviousVersion,
};

async function checkDataExist<T>(params: {
  data: T | null | Promise<T | null>;
  dataIsNotExistMessage?: string;
}) {
  const data = R.isPromise(params.data) ? await params.data : params.data;
  if (!data) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: params.dataIsNotExistMessage || message.error.NOT_FOUND,
    });
  }

  return data;
}

async function checkDuplicate<T>(params: {
  duplicate: T | null | Promise<T | null>;
  current?: { key: keyof T; value: unknown };
  duplicateIsExistingMessage?: string;
}) {
  const data = R.isPromise(params.duplicate) ? await params.duplicate : params.duplicate;
  if (data && params.current?.value == null) {
    // 登録のとき
    // 重複データがあるだけでデータが登録できない
    throw new TRPCError({
      code: 'CONFLICT',
      message: params.duplicateIsExistingMessage || message.error.CONFLICT_DUPLICATE_WHEN_CREATE,
    });
  } else if (data && params.current && data[params.current.key] !== params.current.value) {
    // 更新のとき
    // 重複データが自身と一致しないときだけデータが更新できない
    throw new TRPCError({
      code: 'CONFLICT',
      message: params.duplicateIsExistingMessage || message.error.CONFLICT_DUPLICATE_WHEN_UPDATE,
    });
  }

  return data;
}

async function checkPreviousVersion<T extends { updated_at: Date }>(params: {
  previous: T | null | Promise<T | null>;
  updated_at: string | Date;
  dataIsNotExistMessage?: string;
  previousIsUpdatedMessage?: string;
}) {
  const data = await checkDataExist({
    data: params.previous,
    dataIsNotExistMessage: params.dataIsNotExistMessage,
  });

  const date =
    typeof params.updated_at === 'string' ? new Date(params.updated_at) : params.updated_at;

  if (data.updated_at.getTime() !== date.getTime()) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: params.previousIsUpdatedMessage || message.error.CONFLICT_PREVIOUS_UPDATED,
    });
  }

  return data;
}
