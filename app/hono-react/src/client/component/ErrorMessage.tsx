import type { ReactNode } from 'react';

export function ErrorMessage({ children }: { children?: ReactNode }) {
  if (!children) {
    return undefined;
  }

  return <span className="text-xs text-red-600">{children}</span>;
}
