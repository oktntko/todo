import Link from 'next/link';
import { redirect } from 'next/navigation';

import { cn } from '~/lib/cn';
import { findOperatorFromTokenSSR } from '~/middleware/auth';
import { NotificationService } from '~/service/NotificationService';
import { SpaceService } from '~/service/SpaceService';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const operator = await findOperatorFromTokenSSR();
  if (operator == null) {
    return redirect('/signin');
  }

  const spaceList = await SpaceService.listSpace({ operator });
  const notificationList = await NotificationService.listNotification({ operator });

  return (
    <div className="flex h-dvh">
      {/* sidebar */}
      <aside className="flex h-dvh min-h-0 w-56 shrink-0 flex-col overflow-y-auto bg-gray-900 text-gray-50">
        <Link
          href="/space"
          className="flex items-center gap-1 p-4 text-2xl font-semibold transition-colors hover:text-gray-200"
        >
          <span className="icon-[flat-color-icons--todo-list] h-8 w-8 p-2" />
          <span>MyTodo</span>
        </Link>

        {spaceList.map((space) => {
          return (
            <div key={space.space_id} className="h-full">
              <ul className="pr-1 pl-2 font-medium">
                <li>
                  <Link
                    href={`/space/${space.space_id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm transition hover:brightness-75"
                    style={{ color: space.space_color }}
                  >
                    {space.space_image ? (
                      // oxlint-disable-next-line next/no-img-element
                      <img
                        src={space.space_image}
                        width="16"
                        height="16"
                        decoding="async"
                        className="h-4 w-4 shrink-0 rounded-full object-cover object-center"
                      />
                    ) : (
                      <span className="icon-[ri--image-circle-fill] h-4 w-4 shrink-0"></span>
                    )}
                    <span className="truncate capitalize">{space.space_name}</span>
                  </Link>

                  <ul
                    className={cn('ml-3 border-l-2 border-gray-600 transition-discrete')}
                    style={{ borderColor: space.space_color }}
                  >
                    {(
                      [
                        {
                          name: 'list',
                          route: `/space/${space.space_id}/list`,
                          icon: 'icon-[vaadin--list-ol]',
                        },
                        {
                          name: 'table',
                          route: `/space/${space.space_id}/table`,
                          icon: 'icon-[fontisto--table-2]',
                        },
                        {
                          name: 'board',
                          route: `/space/${space.space_id}/board`,
                          icon: 'icon-[bi--kanban-fill]',
                        },
                        {
                          name: 'calendar',
                          route: `/space/${space.space_id}/calendar`,
                          icon: 'icon-[subway--calendar-2]',
                        },
                        {
                          name: 'whiteboard',
                          route: `/space/${space.space_id}/whiteboard`,
                          icon: 'icon-[hugeicons--whiteboard]',
                        },
                        {
                          name: 'drive',
                          route: `/space/${space.space_id}/drive`,
                          icon: 'icon-[vaadin--folder-open]',
                        },
                        {
                          name: 'chat',
                          route: `/space/${space.space_id}/chat`,
                          icon: 'icon-[vaadin--chat]',
                        },
                        {
                          name: 'setting',
                          route: `/space/${space.space_id}/setting`,
                          icon: 'icon-[uil--setting]',
                        },
                      ] as const
                    ).map((item) => (
                      <li key={item.route}>
                        <Link
                          href={item.route}
                          className="group flex w-full items-center gap-2 rounded-e-full p-2 pl-3 text-base text-gray-200 transition hover:bg-gray-800 hover:text-white"
                          // activeProps={{ className: 'bg-gray-700' }}
                        >
                          <span
                            className={`${item.icon} h-5 w-5 text-gray-200 transition group-hover:text-white`}
                          />
                          <span className="capitalize">{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>
          );
        })}
      </aside>

      {/* main */}
      <div className="flex min-h-0 grow flex-col overflow-y-auto bg-gray-100 text-gray-900">
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
            {/* TODO: csr */}
            {/* <button
              type="button"
              className="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
              onClick={async () => {
                await $dialog.confirm.info('Are you sure you want to sign out?');

                void hono.auth.$delete();
                return $navigate({ to: '/signin' });
              }}
            >
              <span className="icon-[stash--signout-alt] h-5 w-5" />
              <span className="sr-only capitalize">signout</span>
            </button> */}
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

        <div className="grow">{children}</div>
      </div>
    </div>
  );
}
