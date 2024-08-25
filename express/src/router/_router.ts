import { createCallerFactory, router } from '~/middleware/trpc.js';
import { file, FileRouter } from '~/router/FileRouter.js';
import { user } from '~/router/UserRouter.js';

export const TrpcRouter = router({
  user,
  file,
});

export const ExpressRouter = [FileRouter];

export const createCaller = createCallerFactory(TrpcRouter);
