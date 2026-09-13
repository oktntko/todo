import { cn } from '~/lib/cn';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {};

export function MyInput({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900',
        'transition hover:bg-white hover:ring-1 hover:ring-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none',
        'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200 disabled:hover:ring-gray-300 disabled:focus:ring-gray-300',
        className,
      )}
    />
  );
}
