import type { App } from 'vue';
import { useDialogStore } from '~/store/DialogStore';
import PluginLoading from './component/PluginLoading.vue';

type LoadingPlugin = ReturnType<typeof installLoadingPlugin>;

const LoadingPluginKey = Symbol() as InjectionKey<LoadingPlugin>;

export default function (parentApp: App) {
  const loading = installLoadingPlugin(parentApp);

  parentApp.config.globalProperties.$loading = loading;

  parentApp.provide<LoadingPlugin>(LoadingPluginKey, loading);
}

export function useLoading() {
  return inject<LoadingPlugin>(LoadingPluginKey)!;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $loading: LoadingPlugin;
  }
}

function installLoadingPlugin(parentApp: App) {
  const DialogStore = useDialogStore();
  return {
    open() {
      const parent = document.createElement('div');
      document.body.appendChild(parent);

      const app = createApp(PluginLoading, {
        onClose: () => {
          app.unmount();
          document.body.removeChild(parent);
          DialogStore.decrement();
        },
      });

      // https://github.com/quasarframework/quasar/blob/dev/ui/src/install-quasar.js#L25
      app.config.globalProperties = parentApp.config.globalProperties;
      Object.assign(app._context, parentApp._context);

      const vm = app.mount(parent) as InstanceType<typeof PluginLoading>;
      DialogStore.increment();
      return {
        close: vm.close,
      };
    },
  };
}
