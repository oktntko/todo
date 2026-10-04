'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { useMainState } from '@/(main)/space/component/MainLayout/useMainState';
import { MyLoading } from '@/component/MyLoading';
import { cn } from '~/lib/cn';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { space_id } = useParams<{ space_id: string }>();

  const { space_list } = useMainState();

  return (
    <div className="container mx-auto flex max-w-5xl flex-row">
      <aside className="flex w-56 shrink-0 flex-col gap-2 px-4">
        <div>
          <ul className="text-sm">
            {(
              [
                {
                  name: 'general',
                  route: `/space/${space_id}/setting`,
                  icon: 'icon-[uil--setting]',
                },
                {
                  name: 'chat',
                  route: `/space/${space_id}/setting/chat`,
                  icon: 'icon-[vaadin--chat]',
                },
              ] as const
            ).map((item) => (
              <li key={item.route}>
                <SpaceSettingLink {...item} />
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="grow">
        {space_list.find((x) => x.space_id === space_id) ? <>{children}</> : <MyLoading />}
      </div>
    </div>
  );
}

type Props = {
  route: string;
  icon: string;
  name: string;
};

function SpaceSettingLink(props: Props) {
  const pathname = usePathname();

  return (
    <Link
      href={props.route}
      className={cn(
        'group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100',
        pathname === props.route ? 'border-l-blue-400! text-blue-600' : '',
      )}
    >
      <span className={`${props.icon} h-5 w-5 text-gray-500 group-hover:text-gray-900`} />
      <span className="capitalize">{props.name}</span>
    </Link>
  );
}
