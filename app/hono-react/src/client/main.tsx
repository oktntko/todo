import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '~/main.css';
import DialogProvider from '~/plugin/DialogPlugin';
import ToastProvider from '~/plugin/ToastPlugin';

import { MyLoading } from './component/MyLoading';
import { NotFound } from './component/MyNotFound';
import { routeTree } from './routeTree.gen';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPendingComponent: MyLoading,
  defaultNotFoundComponent: NotFound,
  defaultPendingMs: 0,
  defaultPendingMinMs: 0,
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
