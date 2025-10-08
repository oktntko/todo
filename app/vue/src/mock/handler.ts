import type { TrpcRouter } from '@todo/express';
import type { RequestHandler, WebSocketHandler } from 'msw';
import { createTRPCMsw, httpLink } from 'msw-trpc';
import superjson from 'superjson';

const trpcMsw = createTRPCMsw<typeof TrpcRouter>({
  links: [
    httpLink({
      url: `${import.meta.env.BASE_URL}api/trpc`,
    }),
  ],
  transformer: {
    input: superjson,
    output: superjson,
  },
});

export const handlers: Array<RequestHandler | WebSocketHandler> = [
  // auth
  trpcMsw.auth.signup.mutation(() => {
    // void
  }),
  trpcMsw.auth.signin.mutation(() => {
    return {
      auth: true,
    };
  }),
  trpcMsw.auth.signinTwofa.mutation(() => {
    return {
      auth: true,
    };
  }),
  trpcMsw.auth.get.query(() => {
    return {
      auth: true,
    };
  }),
  trpcMsw.auth.delete.mutation(() => {
    // void
  }),
];
