import { handle } from '@hono/vercel';

import { hono } from '../middleware/hono';
import { AichatRouter } from '../router/AichatRouter';
import { AuthRouter } from '../router/AuthRouter';
import { FileRouter } from '../router/FileRouter';
import { GroupRouter } from '../router/GroupRouter';
import { MypageRouter } from '../router/MypageRouter';
import { NotificationRouter } from '../router/NotificationRouter';
import { SpaceRouter } from '../router/SpaceRouter';
import { TodoRouter } from '../router/TodoRouter';
import { WhiteboardRouter } from '../router/WhiteboardRouter';

const api = hono
  .basePath('/api')
  .route('/aichat', AichatRouter)
  .route('/auth', AuthRouter)
  .route('/file', FileRouter)
  .route('/group', GroupRouter)
  .route('/mypage', MypageRouter)
  .route('/notification', NotificationRouter)
  .route('/todo', TodoRouter)
  .route('/space', SpaceRouter)
  .route('/whiteboard', WhiteboardRouter);

export type ApiType = typeof api;

export const GET = handle(api);
export const POST = handle(api);
