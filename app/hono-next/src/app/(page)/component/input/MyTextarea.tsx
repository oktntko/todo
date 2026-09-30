import { cn } from '@/lib/cn';

type MyTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {};

export function MyTextarea({ className, ...props }: MyTextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        'block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900',
        'transition hover:bg-white hover:ring-1 hover:ring-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none',
        'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:hover:bg-gray-400 disabled:hover:ring-gray-300 disabled:focus:ring-gray-300',
        className,
      )}
    />
  );
}
