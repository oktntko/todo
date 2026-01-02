import { inject, type App, type InjectionKey, type PropType } from 'vue';

type ToastPlugin = ReturnType<typeof installToastPlugin>;

const ToastPluginKey = Symbol() as InjectionKey<ToastPlugin>;

export default function (parentApp: App) {
  const toast = installToastPlugin();

  parentApp.config.globalProperties.$toast = toast;

  parentApp.provide<ToastPlugin>(ToastPluginKey, toast);
}

export function useToast() {
  return inject<ToastPlugin>(ToastPluginKey)!;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $toast: ToastPlugin;
  }
}

type ColorType = 'white' | 'gray' | 'green' | 'red' | 'blue' | 'yellow';

function installToastPlugin() {
  const toastContainerTemplate = document.createElement('template');
  toastContainerTemplate.innerHTML = `
    <div
      class="toast-container pointer-events-none fixed bottom-5 left-1/2 z-10 inline-flex -translate-x-1/2 flex-col gap-4"
    ></div>`;

  const container = toastContainerTemplate.content.firstElementChild!.cloneNode(
    true,
  ) as HTMLDivElement;

  document.body.appendChild(container);

  function open(props: { message: string; color: ColorType }) {
    const parent = document.createElement('div');

    const app: App<Element> = createApp(ToastContentApp, {
      ...props,
      onClose() {
        clearTimeout(timerId);
        app.unmount();
        container.removeChild(parent);
      },
    });

    const timerId = setTimeout(() => {
      app.unmount();
      container.removeChild(parent);
    }, 3250);

    container.appendChild(parent);
    app.mount(parent);
  }

  type O = { color?: ColorType };
  return {
    async open(message: string, { color = 'white', ...options }: O = {}) {
      return open({ message, color, ...options });
    },
    async success(message: string, { color = 'green', ...options }: O = {}) {
      return this.open(message, { color, ...options });
    },
    async info(message: string, { color = 'blue', ...options }: O = {}) {
      return this.open(message, { color, ...options });
    },
    async warn(message: string, { color = 'yellow', ...options }: O = {}) {
      return this.open(message, { color, ...options });
    },
    async danger(message: string, { color = 'red', ...options }: O = {}) {
      return this.open(message, { color, ...options });
    },
  };
}

const ToastContentApp = defineComponent({
  props: {
    message: {
      type: String,
      required: true,
    },
    color: {
      type: String as PropType<ColorType>,
      required: true,
    },
  },
  emits: {
    close: () => true,
  },
  setup(props, { emit: $emit }) {
    const contentColor = (() => {
      switch (props.color) {
        case 'green':
          return 'border-green-300 text-green-800';
        case 'blue':
          return 'border-blue-300 text-blue-800';
        case 'yellow':
          return 'border-yellow-300 text-yellow-800';
        case 'red':
          return 'border-red-300 text-red-800';
        case 'white':
          return 'border-gray-300 text-gray-400';
        case 'gray':
          return 'border-gray-300 text-gray-800';
        default:
          return 'border-gray-300 text-gray-800';
      }
    })();

    const iconContainerColor = (() => {
      switch (props.color) {
        case 'green':
          return 'bg-green-100 text-green-800';
        case 'blue':
          return 'bg-blue-100 text-blue-800';
        case 'yellow':
          return 'bg-yellow-100 text-yellow-800';
        case 'red':
          return 'bg-red-100 text-red-800';
        case 'white':
          return 'bg-gray-100 text-gray-400';
        case 'gray':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    })();

    const icon = (() => {
      switch (props.color) {
        case 'green':
          return 'icon-[qlementine-icons--success-12]';
        case 'blue':
          return 'icon-[material-symbols--info-outline-rounded]';
        case 'yellow':
          return 'icon-[material-symbols--warning-outline-rounded]';
        case 'red':
          return 'icon-[material-symbols--dangerous-outline-rounded]';
        case 'white':
        case 'gray':
        default:
          return 'icon-[solar--dialog-line-duotone]';
      }
    })();

    const open = ref(false);
    onMounted(() => {
      open.value = true;
    });

    const toast = useTemplateRef<HTMLDivElement>('toast');

    const timerId = setTimeout(() => {
      open.value = false;
      toast.value?.addEventListener(
        'transitionend',
        () => {
          $emit('close');
        },
        { once: true },
      );
    }, 3000);

    function handleClickCloseButton() {
      clearTimeout(timerId);
      open.value = false;
      toast.value?.addEventListener(
        'transitionend',
        () => {
          $emit('close');
        },
        { once: true },
      );
    }

    return () => (
      <div
        ref="toast"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class={[
          'pointer-events-auto relative flex w-xs items-center gap-2 rounded-lg border bg-white p-4 shadow-md',
          'transition-all duration-200 ease-out',
          contentColor,
          open.value ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0',
        ]}
      >
        <div
          class={[
            'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
            iconContainerColor,
          ]}
        >
          <span class={['h-4 w-4', icon]}></span>
        </div>

        <span class="text-sm leading-relaxed whitespace-pre-wrap">{props.message}</span>

        <button
          type="button"
          class={[
            'absolute top-1 right-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-gray-400 transition outline-none',
            'hover:bg-gray-50 hover:ring-2 hover:ring-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200 disabled:hover:ring-gray-300 disabled:focus:ring-gray-300',
          ]}
          onClick={handleClickCloseButton}
        >
          <span class="icon-[bi--x] h-4 w-4" />
        </button>
      </div>
    );
  },
});
