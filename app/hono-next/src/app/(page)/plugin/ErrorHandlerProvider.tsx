import { useEffect } from 'react';

import { HonoError } from '../middleware/hono';
import { useDialog } from './useDialog';

type Props = {
  children: React.ReactNode;
};

export function ErrorHandlerProvider({ children }: Props) {
  const $dialog = useDialog();

  useEffect(() => {
    function handleError(e: Event) {
      return function (error: unknown) {
        if (error === 'cancel') {
          e.preventDefault();
          return; // dialog cancel
        }

        if (error instanceof HonoError) {
          e.preventDefault();
          console.debug(error.stack);

          const functionLevel =
            0 < error.status && error.status < 400
              ? 'info'
              : 400 <= error.status && error.status < 500
                ? 'warn'
                : 'danger';

          return $dialog.alert[functionLevel](error.message);
        }

        return $dialog.alert.danger('An unexpected error occurred.');
      };
    }

    function handleUnhandledRejection(e: PromiseRejectionEvent) {
      return e.promise.catch(handleError(e));
    }

    function handleErrorEvent(e: ErrorEvent) {
      return handleError(e)(e.error);
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleErrorEvent);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleErrorEvent);
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
