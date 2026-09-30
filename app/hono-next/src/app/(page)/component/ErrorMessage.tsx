import { cn } from '@/lib/cn';

type ErrorMessageProps = React.HTMLAttributes<HTMLSpanElement> & {
  children?: React.ReactNode;
};

export function ErrorMessage({ children, className, ...props }: ErrorMessageProps) {
  if (!children) {
    return undefined;
  }

  return (
    <span {...props} className={cn('text-xs text-red-600', className)}>
      {children}
    </span>
  );
}
