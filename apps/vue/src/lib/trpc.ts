import type { TrpcRouter } from '@todo/express';
import { createTRPCClient, httpLink, TRPCClientError } from '@trpc/client';
import type { inferRouterError, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

export type RouterInput = inferRouterInputs<typeof TrpcRouter>;
export type RouterOutput = inferRouterOutputs<typeof TrpcRouter>;
export type RouterError = inferRouterError<typeof TrpcRouter>;

export function isRouterError(cause: unknown): cause is TRPCClientError<typeof TrpcRouter> {
  return cause instanceof TRPCClientError;
}

export const trpc = createTRPCClient<typeof TrpcRouter>({
  links: [
    httpLink({
      url: `${import.meta.env.BASE_URL}api/trpc`,
      transformer: superjson, // Date to Date
    }),
  ],
});
