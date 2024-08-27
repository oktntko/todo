import type { App } from 'vue';
import { useDialogStore } from '~/store/DialogStore';
import type { ComponentProps } from '~/utility-types';
import PluginDialog from './component/PluginDialog.vue';

type DialogProps = Omit<ComponentProps<typeof PluginDialog>, 'onClose'>;
type DialogPlugin = ReturnType<typeof installDialogPlugin>;

const DialogPluginKey = Symbol() as InjectionKey<DialogPlugin>;

export default function (parentApp: App) {
  const dialog = installDialogPlugin(parentApp);

  parentApp.config.globalProperties.$dialog = dialog;

  parentApp.provide<DialogPlugin>(DialogPluginKey, dialog);
}

export function useDialog() {
  return inject<DialogPlugin>(DialogPluginKey)!;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $dialog: DialogPlugin;
  }
}

function installDialogPlugin(parentApp: App) {
  const DialogStore = useDialogStore();
  return {
    async open(props?: DialogProps) {
      const parent = document.createElement('div');
      document.body.appendChild(parent);

      let app: App<Element>;
      return new Promise<boolean>((resolve) => {
        app = createApp(PluginDialog, {
          ...props,
          onClose: (confirmed: boolean) => {
            resolve(confirmed);
          },
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

    async info(message: string) {
      return this.open({
        message,
        colorset: 'blue',
        icon: 'icon-[bx--info-circle]',
        confirmText: 'OK',
      });
    },

    async alert(message: string) {
      return this.open({
        message,
        colorset: 'yellow',
        icon: 'icon-[bx--error]',
        confirmText: 'OK',
      });
    },

    async confirm(message: string) {
      return this.open({
        message,
        colorset: 'yellow',
        icon: 'icon-[bx--info-circle]',
        confirmText: 'OK',
        cancelText: 'やめる',
      });
    },
  };
}
