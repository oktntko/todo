import type { ReactNode } from 'react';

import { cn } from '~/lib/cn';

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  type: 'checkbox' | 'radio';
  children: ReactNode;
};

export function MyCheckbox({ id, className, children, ...props }: InputProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-1 text-sm font-medium">
      <input
        id={id}
        className={cn('h-4 w-4 border-gray-300 bg-gray-100 text-blue-600', className)}
        {...props}
      />
      {children}
    </label>
  );
}
