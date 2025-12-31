import { createCallerFactory, router } from '~/middleware/trpc';
import { aichat } from '~/router/AiChatRouter';
import { auth } from '~/router/AuthRouter';
import { file, FileRouter } from '~/router/FileRouter';
import { group } from '~/router/GroupRouter';
import { mypage } from '~/router/MypageRouter';
import { todo } from '~/router/TodoRouter';
import { whiteboard } from '~/router/WhiteboardRouter';

export const TrpcRouter = router({
  aichat,
  auth,
  file,
  mypage,
  group,
  todo,
  whiteboard,
});

export const ExpressRouter = [FileRouter];

export const createCaller = createCallerFactory(TrpcRouter);

export type TrpcPaths = DotTrpcKeys<(typeof TrpcRouter)['_def']['record']>;

type IsProcedure<T> = T extends {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _def: any;
}
  ? true
  : false;

type DotTrpcKeys<T> = {
  [K in keyof T]: K extends string
    ? IsProcedure<T[K]> extends true
      ? K
      : DotTrpcKeys<T[K]> extends infer D
        ? D extends string
          ? K extends string
            ? D extends string
              ? `${K}.${D}`
              : never
            : never
          : never
        : never
    : never;
}[keyof T];
