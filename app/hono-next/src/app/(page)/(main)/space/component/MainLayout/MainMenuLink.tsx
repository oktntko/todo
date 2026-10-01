'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '~/lib/cn';

type Props = {
  route: string;
  icon: string;
  name: string;
};

export function MainMenuLink(props: Props) {
  const pathname = usePathname();

  return (
    <li>
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
    </li>
  );
}
