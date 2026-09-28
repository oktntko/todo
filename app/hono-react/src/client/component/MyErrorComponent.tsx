import { type ErrorComponentProps, Navigate } from '@tanstack/react-router';

import { HonoError } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';

export function MyErrorComponent({ error }: ErrorComponentProps) {
  const $dialog = useDialog();

  if (error instanceof HonoError) {
    void $dialog.alert.warn(error.message);
    return <Navigate to="/signin" replace />;
  }

  return <div>{JSON.stringify(error)}</div>;
}
