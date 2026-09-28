import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { MyLoading } from '~/component/MyLoading';
import { MyNotFound } from '~/component/MyNotFound';
import '~/main.css';
import DialogProvider from '~/plugin/DialogPlugin';
import ToastProvider from '~/plugin/ToastPlugin';
import { routeTree } from '~/routeTree.gen';

import { MyErrorComponent } from './component/MyErrorComponent';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPendingComponent: MyLoading,
  defaultNotFoundComponent: MyNotFound,
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
  defaultErrorComponent: MyErrorComponent,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <DialogProvider>
        <RouterProvider router={router} />
      </DialogProvider>
    </ToastProvider>
  </StrictMode>,
);
