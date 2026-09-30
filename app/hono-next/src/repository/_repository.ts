import { R } from '@todo/lib';
import { HTTPException } from 'hono/http-exception';

import { message } from '~/lib/message';

export const _repository = {
  checkDataExist,
  checkDuplicate,
  checkVersion,
};

async function checkDataExist<T>(params: {
  data: T | null | Promise<T | null>;
  dataIsNotExistMessage?: string;
}) {
  const data = R.isPromise(params.data) ? await params.data : params.data;
  if (!data) {
    throw new HTTPException(404, {
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
    throw new HTTPException(409, {
      message: params.duplicateIsExistingMessage || message.error.CONFLICT_DUPLICATE_WHEN_CREATE,
    });
  } else if (data && params.current && data[params.current.key] !== params.current.value) {
    // 更新のとき
    // 重複データが自身と一致しないときだけデータが更新できない
    throw new HTTPException(409, {
      message: params.duplicateIsExistingMessage || message.error.CONFLICT_DUPLICATE_WHEN_UPDATE,
    });
  }

  return data;
}

async function checkVersion<T extends { updated_at: string }>(params: {
  current: T | null | Promise<T | null>;
  updated_at: string;
  dataIsNotExistMessage?: string;
  currentIsUpdatedMessage?: string;
}) {
  const current = await checkDataExist({
    data: params.current,
    dataIsNotExistMessage: params.dataIsNotExistMessage,
  });

  if (params.updated_at !== current.updated_at) {
    throw new HTTPException(409, {
      message: params.currentIsUpdatedMessage || message.error.CONFLICT_CURRENT_UPDATED,
    });
  }

  return current;
}
