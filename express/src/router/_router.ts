import { createCallerFactory, router } from '~/middleware/trpc.js';
import { auth } from '~/router/AuthRouter.js';
import { file, FileRouter } from '~/router/FileRouter.js';
import { user } from '~/router/UserRouter.js';

export const TrpcRouter = router({
  auth,
  file,
  user,
});

export const ExpressRouter = [FileRouter];

export const createCaller = createCallerFactory(TrpcRouter);
