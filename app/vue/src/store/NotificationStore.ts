import type { NotificationRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';

import { R } from '@todo/lib/remeda';
import { defineStore } from 'pinia';
import superjson from 'superjson';
import { computed, ref } from 'vue';

import { trpc, type RouterOutput } from '~/lib/trpc';
import { useToast } from '~/plugin/ToastPlugin';

export const useNotificationStore = defineStore('notification', () => {
  const storedNotificationList = ref<RouterOutput['notification']['list']>([]);

  async function fetchNotification() {
    storedNotificationList.value = await trpc.notification.list.query();
  }

  const sse = new EventSource('/api/notification/subscribe');

  const $toast = useToast();

  sse.onmessage = (event) => {
    try {
      const notification = superjson.parse(event.data) as z.infer<
        typeof NotificationRouterSchema.getOutput
      >;

      storedNotificationList.value = R.pipe(
        storedNotificationList.value,
        R.filter((x) => x.notification_id !== notification.notification_id),
        (x) => {
          x.unshift(notification);
          return x;
        },
      );

      // TODO: Web通知APIにする
      $toast.info(notification.notification_title);
    } catch (e) {
      console.error('sse.onmessage', e);
    }
  };

  sse.onerror = (e) => {
    console.error('sse.onerror', e);
    sse.close();
  };

  const unreadNotificationList = computed(() =>
    storedNotificationList.value.filter((x) => x.notification_status === 'UNREAD'),
  );
  const unreadCount = computed(() => unreadNotificationList.value.length);

  async function readNotification(notification_id: string) {
    await trpc.notification.read.mutate({ notification_id });

    storedNotificationList.value = storedNotificationList.value.filter(
      (x) => x.notification_id !== notification_id,
    );
  }

  return {
    storedNotificationList,
    unreadNotificationList,
    unreadCount,
    fetchNotification,
    readNotification,
  };
});
