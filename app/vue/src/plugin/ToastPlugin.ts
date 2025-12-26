import DOMPurify from 'dompurify';
import { inject, type App, type InjectionKey } from 'vue';

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

  const toastContentTemplate = document.createElement('template');
  toastContentTemplate.innerHTML = `
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="toast-content pointer-events-auto relative flex w-xs translate-y-2 scale-95 items-center gap-2 rounded-lg border bg-linear-to-b from-white to-gray-100 p-4 opacity-0 shadow-md transition-all duration-200 ease-out"
    >
      <div
        class="toast-icon-container inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      >
        <span class="toast-icon h-4 w-4"></span>
      </div>

      <span class="toast-message text-sm leading-relaxed whitespace-pre-wrap"> </span>

      <button
        type="button"
        class="absolute top-1 right-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-gray-400 transition outline-none hover:bg-gray-50 hover:ring-2 hover:ring-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200 disabled:hover:ring-gray-300 disabled:focus:ring-gray-300"
      >
        <span class="icon-[bi--x] h-4 w-4" />
      </button>
    </div>`;

  async function open(props: { message: string; color: ColorType }) {
    const message = DOMPurify.sanitize(props.message);

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

    const contentColor = (() => {
      switch (props.color) {
        case 'green':
          return ['border-green-300', 'text-green-800'];
        case 'blue':
          return ['border-blue-300', 'text-blue-800'];
        case 'yellow':
          return ['border-yellow-300', 'text-yellow-800'];
        case 'red':
          return ['border-red-300', 'text-red-800'];
        case 'white':
          return ['border-gray-300', 'text-gray-400'];
        case 'gray':
          return ['border-gray-300', 'text-gray-800'];
        default:
          return ['border-gray-300', 'text-gray-800'];
      }
    })();

    const iconContainerColor = (() => {
      switch (props.color) {
        case 'green':
          return ['bg-green-100', 'text-green-800'];
        case 'blue':
          return ['bg-blue-100', 'text-blue-800'];
        case 'yellow':
          return ['bg-yellow-100', 'text-yellow-800'];
        case 'red':
          return ['bg-red-100', 'text-red-800'];
        case 'white':
          return ['bg-gray-100', 'text-gray-400'];
        case 'gray':
          return ['bg-gray-100', 'text-gray-800'];
        default:
          return ['bg-gray-100', 'text-gray-800'];
      }
    })();

    const content = toastContentTemplate.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLDivElement;
    content.classList.add(...contentColor);

    // color
    const toastIconContainer = content.querySelector('.toast-icon-container') as HTMLDivElement;
    toastIconContainer.classList.add(...iconContainerColor);

    // icon
    const toastIcon = content.querySelector('.toast-icon') as HTMLSpanElement;
    toastIcon.classList.add(icon);

    // message
    const toastMessage = content.querySelector('.toast-message') as HTMLParagraphElement;
    toastMessage.textContent = message;

    const closeButton = content.querySelector('button') as HTMLButtonElement;
    closeButton.addEventListener('click', () => {
      clearTimeout(timerId);
      content.classList.add('opacity-0', 'translate-y-2', 'scale-95');
      content.addEventListener('transitionend', () => content.remove(), { once: true });
    });

    container.appendChild(content);

    requestAnimationFrame(() => {
      content.classList.remove('opacity-0', 'translate-y-2', 'scale-95');
    });

    const timerId = setTimeout(() => {
      content.classList.add('opacity-0', 'translate-y-2', 'scale-95');
      content.addEventListener('transitionend', () => content.remove(), { once: true });
    }, 3000);
  }

  type O = { color?: ColorType };
  return {
    async open(message: string, { color = 'white' }: O) {
      return open({ message, color });
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
