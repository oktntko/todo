import { createFileRoute } from '@tanstack/react-router';
import { dayjs } from '@todo/lib';

import { cn } from '~/lib/cn';
import { useNotificationStore } from '~/store/NotificationStore';

export const Route = createFileRoute('/_main/mypage/notification')({
  component: function Page() {
    const { notificationList, readNotification } = useNotificationStore();

    return (
      <div className="flex flex-col gap-6">
        <div>
          <ul>
            {notificationList.length > 0 ? (
              notificationList.map((x) => (
                <li key={x.notification_id}>
                  <a
                    href={x.notification_link}
                    className="flex items-center gap-2 p-2 transition-all hover:bg-gray-200"
                    onClick={() => {
                      void readNotification(x.notification_id);
                    }}
                  >
                    <div>
                      <span
                        className={cn(
                          'relative h-6 w-6',
                          x.type === 'todo'
                            ? 'icon-[flat-color-icons--todo-list]'
                            : 'icon-[fluent-emoji-flat--bell]',
                        )}
                      >
                        {x.notification_status === 'UNREAD' && (
                          <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500"></span>
                        )}
                      </span>
                    </div>

                    <div className="grow">
                      <div className="bold line-clamp-2">{x.notification_title}</div>
                      <div className="line-clamp-4 text-xs whitespace-pre-wrap text-gray-600">
                        {x.notification_body}
                      </div>
                      <div className="text-xs text-gray-400">
                        {dayjs(x.notification_at).format('YYYY-MM-DD hh:mm')}
                      </div>
                    </div>
                  </a>
                </li>
              ))
            ) : (
              <li className="flex p-2 capitalize">nothing to do!</li>
            )}
          </ul>
        </div>
      </div>
    );
  },
});
