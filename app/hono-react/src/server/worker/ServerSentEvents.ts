import { z } from '@todo/lib';

import { NotificationRouterSchema } from '@/schema/NotificationRouterSchema';

type SSESubscriber = (notification: z.infer<typeof NotificationRouterSchema.getOutput>) => void;
const subscribers = new Map<string, SSESubscriber>();

export const ServerSentEventsManager = {
  // SSEエンドポイントにアクセスが来たら呼ぶ
  add(user_id: string, callback: SSESubscriber) {
    console.info({ user_id }, 'ServerSentEventsManager#add');
    subscribers.set(user_id, callback);
  },
  remove(user_id: string) {
    console.info({ user_id }, 'ServerSentEventsManager#remove');
    subscribers.delete(user_id);
  },

  // Workerなどから呼び出す
  send(user_id: string, notification: z.infer<typeof NotificationRouterSchema.getOutput>) {
    console.info({ user_id }, 'ServerSentEventsManager#send %o', notification);
    const callback = subscribers.get(user_id);

    if (callback) {
      callback(notification); // オンラインなら送信
    }
  },
};
