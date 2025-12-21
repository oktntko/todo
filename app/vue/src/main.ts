import { isAxiosError } from 'axios';
import App from '~/App.vue';
import router from '~/lib/router';
import { isRouterError } from '~/lib/trpc';
import '~/main.css';
import ModalPlugin from '~/plugin/DialogPlugin';
import ToastPlugin from '~/plugin/ToastPlugin';
import WindowPlugin from '~/plugin/WindowPlugin';

if (import.meta.env.MODE === 'msw') {
  const { worker } = await import('./mock/browser');
  await worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
    onUnhandledRequest: 'bypass',
  });
}

const app = createApp(App);

app.use(createPinia());

router.beforeEach(async () => {
  // ...
  // explicitly return false to cancel the navigation
  return true;
});

app.use(router);

app.use(WindowPlugin);
app.use(ModalPlugin);
app.use(ToastPlugin);

app.mount('#app');

function handleError(error: unknown) {
  if (error === 'cancel') {
    return; // dialog cancel
  }

  if (isAxiosError(error) || isRouterError(error)) {
    console.warn('http error', error);
    const { status, message } = (function () {
      if (isAxiosError(error)) {
        return { status: error.status ?? 0, message: error.message };
      } else {
        return { status: error.data?.httpStatus ?? 0, message: error.message };
      }
    })();

    if (status === 401 /*UNAUTHORIZED*/ || status === 403 /*FORBIDDEN*/) {
      router.replace({ name: '/(auth)/signin' });
    }

    const color =
      0 < status && status < 400 ? 'blue' : 400 <= status && status < 500 ? 'yellow' : 'red';

    return app.config.globalProperties.$dialog.alert.open(message, { color });
  }

  // unknown error
  console.error('unknown error', error);
}

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  event.promise.catch(handleError);
});

app.config.errorHandler = handleError;
