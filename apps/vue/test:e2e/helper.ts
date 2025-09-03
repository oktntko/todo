import type { TestInfo } from '@playwright/test';
import path from 'path';
import superjson from 'superjson';

export function jsonStringifyTrpcSuccessResponse<T>(obj: T) {
  return JSON.stringify({
    result: {
      data: {
        json: superjson.serialize(obj).json,
      },
    },
  });
}

export function jsonStringifyTrpcErrorResponse(
  obj: {
    code: number;
    data: {
      httpStatus: number;
      code: string;
      path: string;
      cause: unknown;
    };
    message: string;
  } = {
    code: -32600,
    data: {
      cause: null,
      code: 'BAD_REQUEST',
      httpStatus: 400,
      path: 'trpc.path',
    },
    message: '[test] Error Message.',
  },
) {
  return JSON.stringify({
    error: {
      json: superjson.serialize(obj).json,
    },
  });
}

const pathList: string[] = [];
export function screenshotPath(testInfo: TestInfo) {
  const result = path.join('.report', 'e2e', 'screenshot', ...testInfo.titlePath);
  pathList.push(result);

  const count = pathList.filter((x) => x === result).length;
  return path.join(result, count + '.png');
}
