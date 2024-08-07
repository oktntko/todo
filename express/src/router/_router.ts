import { createCallerFactory, router } from '~/middleware/trpc.js';
import { user } from '~/router/UserRouter.js';

export const TrpcRouter = router({
  user,
});

export const createCaller = createCallerFactory(TrpcRouter);
