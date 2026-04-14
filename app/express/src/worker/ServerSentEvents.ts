import { z } from '@todo/lib/zod';

import { log } from '~/lib/log4js';
import { NotificationRouterSchema } from '~/schema/NotificationRouterSchema';

type SSESubscriber = (notification: z.infer<typeof NotificationRouterSchema.getOutput>) => void;
const subscribers = new Map<string, SSESubscriber>();

export const ServerSentEventsManager = {
  // SSEエンドポイントにアクセスが来たら呼ぶ
  add(user_id: string, callback: SSESubscriber) {
    log.trace('ServerSentEventsManager#add', user_id);
    subscribers.set(user_id, callback);
    log.trace('ServerSentEventsManager#add', subscribers.get(user_id));
  },
  remove(user_id: string) {
    log.trace('ServerSentEventsManager#remove', user_id);
    subscribers.delete(user_id);
  },

  // Workerなどから呼び出す
  send(user_id: string, notification: z.infer<typeof NotificationRouterSchema.getOutput>) {
    log.trace('ServerSentEventsManager#send', user_id, notification);
    const callback = subscribers.get(user_id);
    log.trace('ServerSentEventsManager#send', user_id, callback);

    if (callback) {
      callback(notification); // オンラインなら送信
    }
  },
};
