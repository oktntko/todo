import type { App, Component } from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import { useDialogStore } from '~/store/DialogStore';

type ModalPlugin = ReturnType<typeof installModalPlugin>;

const ModalPluginKey = Symbol() as InjectionKey<ModalPlugin>;

export default function (parentApp: App) {
  const modal = installModalPlugin(parentApp);

  parentApp.config.globalProperties.$modal = modal;

  parentApp.provide<ModalPlugin>(ModalPluginKey, modal);
}

export function useModal() {
  return inject<ModalPlugin>(ModalPluginKey)!;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $modal: ModalPlugin;
  }
}

function installModalPlugin(parentApp: App) {
  const DialogStore = useDialogStore();
  return {
    async open<T, C extends Component>(
      component: C,
      props?: (
        resolve: (value: T | PromiseLike<T>) => void,
        reject: (reason?: unknown) => void,
      ) => ComponentProps<C>,
    ) {
      const parent = document.createElement('div');
      document.body.appendChild(parent);

      let app: App<Element>;
      return new Promise<T>((resolve, reject) => {
        // TODO: onClose 以外のイベントも Close できるようにする
        app = createApp(component, {
          ...props?.(resolve, reject),
        });

        // https://github.com/quasarframework/quasar/blob/dev/ui/src/install-quasar.js#L25
        app.config.globalProperties = parentApp.config.globalProperties;
        Object.assign(app._context, parentApp._context);

        app.mount(parent);
        DialogStore.increment();
      }).finally(() => {
        app.unmount();
        document.body.removeChild(parent);
        DialogStore.decrement();
      });
    },
  };
}
