'use client';

import { useRouter } from 'next/navigation';

import { hono } from '@/middleware/hono';
import { useDialog } from '@/plugin/useDialog';

type Props = {
  className?: string;
};

export function LogoutButton({ className }: Props) {
  const $dialog = useDialog();
  const $router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await $dialog.confirm.info('Are you sure you want to sign out?');

        await hono.auth.delete.$post();
        return $router.push('/signin');
      }}
    >
      <span className="icon-[stash--signout-alt] h-5 w-5" />
      <span className="sr-only capitalize">signout</span>
    </button>
  );
}
