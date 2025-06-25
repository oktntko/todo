import { createCallerFactory, router } from '~/middleware/trpc';
import { auth } from '~/router/AuthRouter';
import { file, FileRouter } from '~/router/FileRouter';
import { space } from '~/router/SpaceRouter';
import { todo } from '~/router/TodoRouter';
import { user } from '~/router/UserRouter';

export const TrpcRouter = router({
  auth,
  file,
  space,
  todo,
  user,
});

export const ExpressRouter = [FileRouter];

export const createCaller = createCallerFactory(TrpcRouter);
