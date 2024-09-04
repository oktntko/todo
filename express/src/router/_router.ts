import { createCallerFactory, router } from '~/middleware/trpc.js';
import { auth } from '~/router/AuthRouter.js';
import { file, FileRouter } from '~/router/FileRouter.js';
import { space } from '~/router/SpaceRouter.js';
import { todo } from '~/router/TodoRouter.js';
import { user } from '~/router/UserRouter.js';

export const TrpcRouter = router({
  auth,
  file,
  space,
  todo,
  user,
});

export const ExpressRouter = [FileRouter];

export const createCaller = createCallerFactory(TrpcRouter);
