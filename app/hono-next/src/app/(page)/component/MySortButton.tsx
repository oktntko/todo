import type { ButtonHTMLAttributes } from 'react';

import { cn } from '~/lib/cn';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  field: string;
  sort: {
    field: string;
    order: 'asc' | 'desc' | '';
  };
};

export function MySortButton({ field, sort, className, ...props }: Props) {
  return (
    <button
      title={field === sort.field ? sort.order : ''}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-full p-1 transition-colors hover:bg-gray-200',
        field === sort.field ? 'text-blue-500' : '',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'h-3 w-3',
          field !== sort.field || sort.order === '' ? 'icon-[fa6-solid--sort]' : '',
          field === sort.field && sort.order === 'asc' ? 'icon-[fa6-solid--sort-up]' : '',
          field === sort.field && sort.order === 'desc' ? 'icon-[fa6-solid--sort-down]' : '',
        )}
      ></span>
    </button>
  );
}
