import { isAxiosError } from 'axios';
import App from '~/App.vue';
import router from '~/lib/router';
import { isRouterError } from '~/lib/trpc';
import '~/main.css';
import DialogPlugin from '~/plugin/DialogPlugin';
import LoadingPlugin from '~/plugin/LoadingPlugin';
import ModalPlugin from '~/plugin/ModalPlugin';
import ToastPlugin from '~/plugin/ToastPlugin';
import WindowPlugin from '~/plugin/WindowPlugin';

const app = createApp(App);

app.use(createPinia());

router.beforeEach(async () => {
  // ...
  // explicitly return false to cancel the navigation
  return true;
});

app.use(router);

app.use(WindowPlugin);
app.use(DialogPlugin);
app.use(LoadingPlugin);
app.use(ModalPlugin);
app.use(ToastPlugin);

app.mount('#app');

function handleError(error: unknown) {
  console.error('error', error);
  if (isAxiosError(error) || isRouterError(error)) {
    const { status, message } = (function () {
      if (isAxiosError(error)) {
        return { status: error.status ?? 0, message: error.message };
      } else {
        return { status: error.data?.httpStatus ?? 0, message: error.message };
      }
    })();
    const colorset =
      0 < status && status < 400 ? 'blue' : 400 <= status && status < 500 ? 'yellow' : 'red';

    if (status === 401 /*UNAUTHORIZED*/ || status === 403 /*FORBIDDEN*/) {
      router.replace({ name: '/(auth)/login' });
    }

    return app.config.globalProperties.$dialog.open({
      colorset,
      icon: colorset === 'blue' ? 'icon-[bx--info-circle]' : 'icon-[bx--error]',
      message,
      cancelText: 'OK',
    });
  } else {
    console.error(error);
  }
}

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  event.promise.catch(handleError);
});

app.config.errorHandler = handleError;
