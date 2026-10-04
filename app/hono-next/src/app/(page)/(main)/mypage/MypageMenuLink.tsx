'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '~/lib/cn';

type Props = {
  route: string;
  icon: string;
  name: string;
};

export function MypageMenuLink(props: Props) {
  const pathname = usePathname();

  return (
    <Link
      href={props.route}
      className={cn(
        'group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 transition-colors hover:bg-gray-100',
        props.route === pathname ? 'border-l-blue-400! text-blue-600' : '',
      )}
    >
      <span className={`${props.icon} h-5 w-5 text-gray-500 group-hover:text-gray-900`} />
      <span className="capitalize">{props.name}</span>
    </Link>
  );
}
