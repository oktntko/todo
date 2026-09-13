import { useState } from 'react';

import { cn } from '~/lib/cn';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {};

export function MyInputPassword({ className, type: _, ...props }: InputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={cn(
          'rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900',
          'transition hover:bg-white hover:ring-1 hover:ring-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none',
          'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200 disabled:hover:ring-gray-300 disabled:focus:ring-gray-300',
          className,
        )}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-sm leading-5"
        onClick={() => setShow((current) => !current)}
      >
        <span className={show ? 'icon-[fa6-solid--eye-slash]' : 'icon-[fa6-solid--eye]'}></span>
      </button>
    </div>
  );
}
