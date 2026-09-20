import { R } from '@todo/lib';
import { type InferResponseType } from 'hono';
import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

import { hono } from '~/middleware/hono';
import { useToast } from '~/plugin/useToast';

export const notificationListAtom = atom<InferResponseType<typeof hono.notification.list.$post>>(
  [],
);

export function useNotificationStore() {
  const [notificationList, setNotificationList] = useAtom(notificationListAtom);

  async function fetchNotification() {
    setNotificationList(await hono.notification.list.$post().unwrap());
  }

  async function readNotification(notification_id: string) {
    await hono.notification.read.$post({ json: { notification_id } });

    setNotificationList(notificationList.filter((x) => x.notification_id !== notification_id));
  }

  const sse = useRef(new EventSource('/api/notification/subscribe'));

  const $toast = useToast();

  useEffect(() => {
    sse.current.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as InferResponseType<
          typeof hono.notification.list.$post
        >[number];

        setNotificationList((currentList) => {
          return R.pipe(
            currentList,
            R.filter((x) => x.notification_id !== notification.notification_id),
            (x) => {
              x.unshift(notification);
              return x;
            },
          );
        });

        // TODO: Web通知APIにする
        $toast.info(notification.notification_title);
      } catch (e) {
        console.error('sse.onmessage', e);
      }
    };

    sse.current.onerror = (e) => {
      console.error('sse.onerror', e);
      sse.current.close();
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [$toast]);

  const unreadNotificationList = notificationList.filter((x) => x.notification_status === 'UNREAD');
  const unreadCount = notificationList.length;

  return {
    notificationList,
    unreadNotificationList,
    unreadCount,
    fetchNotification,
    readNotification,
  };
}
