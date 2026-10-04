'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { cn } from '~/lib/cn';

import { useMainState } from './useMainState';

export function MainMenuSidebar() {
  const { space_id } = useParams<{ space_id: string }>();
  const { space_list } = useMainState();

  return (
    <>
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
    </>
  );
}

type Props = {
  route: string;
  icon: string;
  name: string;
};

export function MainMenuLink(props: Props) {
  const pathname = usePathname();

  return (
    <Link
      href={props.route}
      className={cn(
        'group flex w-full items-center gap-2 rounded-e-full p-2 pl-3 text-base text-gray-200 transition hover:bg-gray-800 hover:text-white',
        pathname.startsWith(props.route) ? 'bg-gray-700' : '',
      )}
    >
      <span className={`${props.icon} h-5 w-5 text-gray-200 transition group-hover:text-white`} />
      <span className="capitalize">{props.name}</span>
    </Link>
  );
}
