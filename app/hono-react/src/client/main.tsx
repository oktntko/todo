import { Routes } from '@generouted/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '~/main.css';
import DialogProvider from '~/plugin/DialogPlugin';
import ToastProvider from '~/plugin/ToastPlugin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <DialogProvider>
        <Routes />
      </DialogProvider>
    </ToastProvider>
  </StrictMode>,
);
