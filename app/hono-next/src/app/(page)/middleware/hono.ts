import { hc, type ClientResponse } from 'hono/client';

import type { ApiType } from '@/app/api/[...route]/route';

type UnwrappedPromise<T> = Promise<ClientResponse<T>> & { unwrap(): Promise<T> };

type SafeClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => Promise<ClientResponse<infer R>>
    ? (...args: Args) => UnwrappedPromise<R>
    : T[K] extends object
      ? SafeClient<T[K]>
      : T[K];
};

const base = hc<ApiType>('/').api;

// oxlint-disable-next-line typescript/no-explicit-any
function wrap(obj: any) {
  return new Proxy(obj, {
    get: (target, prop: string) => {
      const val = target[prop];
      if (typeof val === 'function' && prop.startsWith('$')) {
        // oxlint-disable-next-line typescript/no-explicit-any
        return (...args: any[]) => {
          const promise = val(...args);
          return Object.assign(
            // oxlint-disable-next-line typescript/no-explicit-any
            promise.then((res: any) => res),
            {
              unwrap: async () => {
                const res = await promise;
                if (res.ok) {
                  return res.json();
                }

                const status = res.status;
                const error = await res.json();
                if (hasMessage(error)) {
                  throw new HonoError(error.message, status);
                } else {
                  throw new HonoError('An internal server error occurred.', status);
                }
              },
            },
          );
        };
      }

      return typeof val === 'function' && val !== null ? wrap(val) : val;
    },
  });
}

export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

export class HonoError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HonoError';
    this.status = status;
  }
}

export const hono = wrap(base) as SafeClient<typeof base>;
