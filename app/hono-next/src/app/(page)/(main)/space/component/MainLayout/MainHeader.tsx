import Link from 'next/link';

import { LogoutButton } from './LogoutButton';

export function MainHeader() {
  return (
    <header className="flex h-16 items-center justify-between p-4">
      <nav className="flex items-center">
        <button
          type="button"
          className="flex w-48 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-2 py-1 text-sm text-gray-900 transition-colors hover:border-blue-500 hover:bg-white"
        >
          <span className="icon-[bx--search] h-4 w-4" />
          <span className="text-gray-500 capitalize">search</span>
        </button>
      </nav>

      <nav className="flex items-center gap-2">
        <LogoutButton className="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200" />
        <button
          type="button"
          className="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
          title="bookmark"
        >
          <span className="icon-[bxs--bookmark] h-5 w-5" />
          <span className="sr-only capitalize">bookmark</span>
        </button>
        {/* <MyDropdown
              className="z-100"
              v-slots={
                {
                  button: ({ toggle }) => (
                    <button
                      type="button"
                      className="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
                      title="notification"
                      onClick={toggle}
                    >
                      {NotificationStore.unreadCount > 0 && (
                        <div className="absolute top-0 right-0 min-w-4 translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-white bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                          {NotificationStore.unreadCount > 99
                            ? '99+'
                            : NotificationStore.unreadCount}
                        </div>
                      )}
                      <span className="icon-[bx--notification] h-5 w-5" />
                      <span className="sr-only capitalize">notification</span>
                    </button>
                  ),

                  default: () => (
                    <div className="w-96 divide-gray-200 rounded-sm border border-gray-300 bg-white shadow-md">
                      <h1 className="flex items-center gap-2 p-2 text-xs text-gray-500">
                        <span className="capitalize">notification</span>
                      </h1>

                      <ul>
                        {NotificationStore.unreadNotificationList.length > 0 ? (
                          NotificationStore.unreadNotificationList.map((x) => (
                            <li key={x.notification_id}>
                              <a
                                href={x.notification_link}
                                className="flex items-center gap-1 p-2 transition-all hover:bg-gray-200"
                                onClick={() => {
                                  void NotificationStore.readNotification(x.notification_id);
                                }}
                              >
                                <div>
                                  <span
                                    className={[
                                      'relative h-6 w-6',
                                      x.type === 'todo'
                                        ? 'icon-[flat-color-icons--todo-list]'
                                        : 'icon-[fluent-emoji-flat--bell]',
                                    ]}
                                  />
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

                      <div className="flex items-center justify-center p-2 text-sm">
                        <RouterLink
                          to={{
                            name: '//mypage/notification',
                          }}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          <span className="capitalize">view all notification</span>
                        </RouterLink>
                      </div>
                    </div>
                  ),
                } satisfies MyDropdownSlots
              }
            ></MyDropdown> */}

        <Link
          href="/mypage"
          className="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
        >
          <span className="icon-[radix-icons--avatar] h-5 w-5" />
          <span className="sr-only capitalize">mypage</span>
        </Link>
      </nav>
    </header>
  );
}
