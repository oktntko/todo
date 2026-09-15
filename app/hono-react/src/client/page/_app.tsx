import { useEffect } from 'react';
import { Outlet } from 'react-router';

import { HonoError } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';

export default function Layout() {
  const $dialog = useDialog();

  useEffect(() => {
    function handleError(event: PromiseRejectionEvent) {
      event.promise.catch((error: unknown) => {
        if (error === 'cancel') {
          return; // dialog cancel
        }

        if (error instanceof HonoError) {
          console.warn('http error', error);
          const set =
            0 < error.status && error.status < 400
              ? 'info'
              : 400 <= error.status && error.status < 500
                ? 'warning'
                : 'danger';
          return $dialog.alert.open(error.message, {
            set,
          });
        }

        // unknown error
        console.error('unknown error', error);
      });
    }
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleError);
    };
  });

  return (
    <div>
      <Outlet />
    </div>
  );
}
