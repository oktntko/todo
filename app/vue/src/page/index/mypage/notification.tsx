import { dayjs } from '@todo/lib/dayjs';
import { defineComponent } from 'vue';

import { useNotificationStore } from '~/store/NotificationStore';

export default defineComponent(() => {
  const NotificationStore = useNotificationStore();

  return () => (
    <div class="flex flex-col gap-6">
      <div>
        <ul>
          {NotificationStore.storedNotificationList.length > 0 ? (
            NotificationStore.storedNotificationList.map((x) => (
              <li key={x.notification_id}>
                <a
                  href={x.notification_link}
                  class="flex items-center gap-2 p-2 transition-all hover:bg-gray-200"
                  onClick={() => {
                    void NotificationStore.readNotification(x.notification_id);
                  }}
                >
                  <div>
                    <span
                      class={[
                        'relative h-6 w-6',
                        x.type === 'todo'
                          ? 'icon-[flat-color-icons--todo-list]'
                          : 'icon-[fluent-emoji-flat--bell]',
                      ]}
                    >
                      {x.notification_status === 'UNREAD' && (
                        <span class="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500"></span>
                      )}
                    </span>
                  </div>

                  <div class="grow">
                    <div class="bold line-clamp-2">{x.notification_title}</div>
                    <div class="line-clamp-4 text-xs whitespace-pre-wrap text-gray-600">
                      {x.notification_body}
                    </div>
                    <div class="text-xs text-gray-400">
                      {dayjs(x.notification_at).format('YYYY-MM-DD hh:mm')}
                    </div>
                  </div>
                </a>
              </li>
            ))
          ) : (
            <li class="flex p-2 capitalize">nothing to do!</li>
          )}
        </ul>
      </div>
    </div>
  );
});
