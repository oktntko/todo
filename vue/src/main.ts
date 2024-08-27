import App from '~/App.vue';
import '~/lib/dayjs';
import router from '~/lib/router';
import { isRouterError } from '~/lib/trpc';
import '~/lib/zod';
import '~/main.css';
import DialogPlugin from '~/plugin/DialogPlugin';
import LoadingPlugin from '~/plugin/LoadingPlugin';
import ModalPlugin from '~/plugin/ModalPlugin';
import ToastPlugin from '~/plugin/ToastPlugin';
import WindowPlugin from '~/plugin/WindowPlugin';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(WindowPlugin);
app.use(DialogPlugin);
app.use(LoadingPlugin);
app.use(ModalPlugin);
app.use(ToastPlugin);

app.mount('#app');

function handleError(error: unknown) {
  console.error('error', error);
  if (isRouterError(error)) {
    const status = error.data?.httpStatus ?? 0;
    const colorset =
      0 < status && status < 400 ? 'blue' : 400 <= status && status < 500 ? 'yellow' : 'red';

    if (status === 401 /*UNAUTHORIZED*/ || status === 403 /*FORBIDDEN*/) {
      router.replace('/login');
    }

    return app.config.globalProperties.$dialog.open({
      colorset,
      icon: colorset === 'blue' ? 'icon-[bx--info-circle]' : 'icon-[bx--error]',
      message: error.message,
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
