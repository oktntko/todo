import Link from 'next/link';
import { redirect } from 'next/navigation';

import { cn } from '~/lib/cn';
import { findOperatorFromTokenSSR } from '~/middleware/auth';
import { removeSymbol } from '~/middleware/prisma';
import { NotificationService } from '~/service/NotificationService';
import { SpaceService } from '~/service/SpaceService';

import { MainHeader } from './MainHeader';
import { MainMenuLink } from './MainMenuLink';
import { MainStateProvider } from './MainStateProvider';

export async function MainLayout({
  children,
  space_id,
}: {
  children: React.ReactNode;
  space_id?: string;
}) {
  const operator = await findOperatorFromTokenSSR();
  if (operator == null) {
    return redirect('/signin');
  }

  const space_list = await SpaceService.listSpace({ operator }).then(removeSymbol);
  const notification_list = await NotificationService.listNotification({ operator }).then(
    removeSymbol,
  );

  return (
    <MainStateProvider space_list={space_list} notification_list={notification_list}>
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

          {space_list.map((space) => {
            return (
              <details key={space.space_id} name="spaceList" open={space.space_id === space_id}>
                <summary className="block font-medium">
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
                </summary>
                <li>
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
                        <MainMenuLink {...item} />
                      </li>
                    ))}
                  </ul>
                </li>
              </details>
            );
          })}
        </aside>

        {/* main */}
        <div className="flex min-h-0 grow flex-col overflow-y-auto bg-gray-100 text-gray-900">
          <MainHeader />

          <div className="grow">{children}</div>
        </div>
      </div>
    </MainStateProvider>
  );
}
