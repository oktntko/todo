import {
  computed,
  createApp,
  defineComponent,
  inject,
  ref,
  Suspense,
  Transition,
  type App,
  type Component,
  type InjectionKey,
  type InputHTMLAttributes,
  type PropType,
} from 'vue';
import type { ComponentProps } from 'vue-component-type-helpers';
import MyButton from '~/component/button/MyButton';

type DialogPlugin = ReturnType<typeof installDialogPlugin>;

const DialogPluginKey = Symbol() as InjectionKey<DialogPlugin>;

export default function (parentApp: App) {
  const $dialog = installDialogPlugin(parentApp);

  parentApp.config.globalProperties.$dialog = $dialog;

  parentApp.provide<DialogPlugin>(DialogPluginKey, $dialog);
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
  const dialogTemplate = document.createElement('template');
  dialogTemplate.innerHTML = `
  <dialog
    closedby="any"
    class="
      m-auto overflow-visible bg-transparent outline-hidden

      transition transition-discrete duration-200 ease-out
      scale-95 opacity-0
      starting:[[open]]:scale-95 starting:[[open]]:opacity-0
      [[open]]:scale-100 [[open]]:opacity-100

      backdrop:bg-gray-400/50 backdrop:backdrop-blur-xs
      backdrop:transition backdrop:transition-discrete backdrop:duration-200 backdrop:ease-out
      backdrop:opacity-0
      starting:[[open]]:backdrop:opacity-0
      [[open]]:backdrop:opacity-100
      "
    >
  </dialog>`;

  const dialogCloseButtonTemplate = document.createElement('template');
  dialogCloseButtonTemplate.innerHTML = `
    <button
      type="button"
      class="
        absolute top-2 right-2 h-6 w-6 cursor-pointer rounded-full transition shadow
        disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200 disabled:hover:ring-gray-300 disabled:focus:ring-gray-300
        hover:ring-2 focus:ring-2 focus:outline-none outline-none
        bg-transparent text-gray-400 hover:bg-gray-50 hover:ring-gray-300 focus:ring-gray-300
      "
      aria-label="Close"
    >
      <span class="icon-[bi--x] h-6 w-6" />
    </button>`;

  async function showModal<T, C extends Component>(
    component: C,
    props?: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: unknown) => void,
    ) => ComponentProps<C>,
    {
      closedby = 'any',
      showCloseButton = true,
    }: {
      closedby?:
        | 'any' /* 外側タップ */
        | 'closerequest' /* Esc・戻るジェスチャー */
        | 'none' /* dialog.close()のみ */;
      showCloseButton?: boolean;
    } = {},
  ) {
    // HTML dialog を作る
    const dialog = dialogTemplate.content.firstElementChild!.cloneNode(true) as HTMLDialogElement;
    dialog.setAttribute('closedby', closedby);

    // 閉じるボタン
    if (showCloseButton) {
      const closeButton = dialogCloseButtonTemplate.content.firstElementChild!.cloneNode(
        true,
      ) as HTMLButtonElement;
      dialog.appendChild(closeButton);

      closeButton.addEventListener('click', () => {
        dialog.close('cancel');
      });
    }

    let app: App<Element>;
    return new Promise<T>((resolve, reject) => {
      // vue アプリを作る
      app = createApp(DialogApp, {
        component,
        ...props?.(
          function trapResolve(value: T | PromiseLike<T>) {
            dialog.close('cancel');
            return resolve(value);
          },
          function trapReject(reason?: unknown) {
            dialog.close('cancel');
            return reject(reason);
          },
        ),
      });

      // dialog 標準のクローズが呼ばれたときに promise が解決しないので処理する
      dialog.addEventListener(
        'close',
        () => {
          /**
           * | 操作                   | returnValue                |
           * | ---------------------- | -------------------------- |
           * | dialog.close()         | ""（引数なし）             |
           * | dialog.close("foo")    | "foo"                      |
           * | Esc                    | "cancel"                   |
           * | <form method="dialog"> | button.value               |
           * | 外側クリック           | "cancel"（多くのブラウザ） |
           */

          // 開いてから素早く閉じると transitionend が発火しないことがある
          // close イベントが呼ばれてから transitionend が発火するまでは duration-200[ms] に従うが、
          // 厳密にはまちまちなため、 250ms を超えた場合は必ず処理する
          const timerId = setTimeout(() => {
            app.unmount();
            document.body.removeChild(dialog);
          }, 250);

          // close のアニメーションが完了したら要素を完全に削除する
          dialog.addEventListener(
            'transitionend',
            (e) => {
              if (e.target === dialog) {
                clearTimeout(timerId);
                app.unmount();
                document.body.removeChild(dialog);
              }
            },
            { once: true },
          );

          return reject(dialog.returnValue);
        },
        { once: true },
      );

      // https://github.com/quasarframework/quasar/blob/4ebebf02ab0cc7c049d2697544210115ed89e491/ui/src/install-quasar.js#L33
      app.config.globalProperties = parentApp.config.globalProperties;
      Object.assign(app._context, parentApp._context);

      // Suspense で解決されなかった場合、ダイアログを閉じて親アプリに伝える
      // ダイアログにダイアログを重ねていると、2層目以降のダイアログのリジェクトは大元のアプリに伝わらない
      app.config.errorHandler = (error) => {
        dialog.close('cancel');
        reject(error);
      };

      // HTML Node上に追加する
      document.body.appendChild(dialog);
      const parent = document.createElement('div');
      dialog.appendChild(parent);

      app.mount(parent);

      // dialogを開く
      dialog.showModal();
    });
  }

  async function showWindowDialog<T extends string>(
    message: string,
    options?: WindowDialogOptions,
  ) {
    return showModal<T, typeof WindowDialog>(WindowDialog, (resolve, reject) => ({
      message,
      ...options,
      onConfirm: (value) => {
        resolve(value as T);
      },
      onCancel: reject,
    }));
  }

  return {
    showModal,

    get alert() {
      type O = Pick<WindowDialogOptions, 'color' | 'confirmText'>;
      return {
        async open(message: string, { confirmText = 'OK', ...options }: O = {}) {
          return showWindowDialog<'confirm' | 'cancel'>(message, { confirmText, ...options });
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
    },

    get confirm() {
      type O = Pick<WindowDialogOptions, 'color' | 'confirmText' | 'cancelText'>;
      return {
        async open(
          message: string,
          { confirmText = 'YES', cancelText = 'NO', ...options }: O = {},
        ) {
          return showWindowDialog<'YES' | 'cancel'>(message, {
            confirmText,
            cancelText,
            confirmValue: 'YES',
            ...options,
          });
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
    },

    get prompt() {
      type O = Pick<WindowDialogOptions, 'color' | 'confirmText' | 'cancelText' | 'prompt'>;
      return {
        async open(
          message: string,
          {
            confirmText = 'confirm',
            cancelText = 'cancel',
            prompt = { type: 'text' },
            ...options
          }: O = {},
        ) {
          return showWindowDialog<`confirm:${string}` | 'cancel'>(message, {
            confirmText,
            cancelText,
            prompt,
            ...options,
          });
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
    },

    loading() {
      const dialog = dialogTemplate.content.firstElementChild!.cloneNode(true) as HTMLDialogElement;
      dialog.setAttribute('closedby', 'none');

      dialog.addEventListener('close', () => {
        const timerId = setTimeout(() => {
          document.body.removeChild(dialog);
        }, 250);

        // close のアニメーションが完了したら要素を完全に削除する
        dialog.addEventListener(
          'transitionend',
          (e) => {
            if (e.target === dialog) {
              clearTimeout(timerId);
              document.body.removeChild(dialog);
            }
          },
          { once: true },
        );
      });

      dialog.insertAdjacentHTML(
        'beforeend',
        `
<div class="flex flex-col items-center bg-transparent p-8">
  <span class="icon-[eos-icons--bubble-loading] text-opacity-60 h-16 w-16 text-gray-600"></span>
  <span class="sr-only">Loading...</span>
  <input
    autofocus
    name="loading"
    class="h-0 w-0 border-none bg-transparent caret-transparent outline-hidden"
  />
</div>`,
      );

      document.body.appendChild(dialog);

      dialog.showModal();

      return {
        close: () => dialog.close('cancel'),
      };
    },
  };
}

function DialogApp<C extends Component>(props: { component: C } & ComponentProps<C>) {
  const { component: Component, ...$attrs } = props;

  return (
    <div>
      {/* dialog 本体のアニメーションと合わせる */}
      <Transition
        mode="out-in"
        enterFromClass="scale-95 opacity-0"
        enterActiveClass="transition transition-discrete duration-200 ease-out"
        enterToClass="scale-100 opacity-100"
      >
        <Suspense
          v-slots={{
            default: () => <Component {...$attrs}></Component>,
            fallback: () => (
              <div class="flex flex-col items-center bg-transparent p-8">
                <span class="icon-[eos-icons--bubble-loading] text-opacity-60 h-16 w-16 text-gray-600"></span>
                <span class="sr-only">Loading...</span>
                <input
                  autofocus
                  name="loading"
                  class="h-0 w-0 border-none bg-transparent caret-transparent outline-hidden"
                />
              </div>
            ),
          }}
        ></Suspense>
      </Transition>
    </div>
  );
}

// defineComponent((props) => () => (<div></div>)) だとプロパティが受け取れない
// function コンポーネントだと ref が使えない（リアクティブじゃない）
type ColorType = 'white' | 'gray' | 'green' | 'red' | 'blue' | 'yellow';
type WindowDialogOptions = {
  color?: ColorType;
  confirmText?: string;
  confirmValue?: string;
  cancelText?: string;
  prompt?: InputHTMLAttributes;
};

const WindowDialog = defineComponent({
  props: {
    message: {
      type: String,
      required: true,
    },
    color: {
      type: String as PropType<ColorType>,
      default: 'white',
    },
    confirmText: {
      type: String,
      default: 'confirm',
    },
    confirmValue: {
      type: String,
      default: 'confirm',
    },
    cancelText: {
      type: String,
      default: 'cancel',
    },
    prompt: Object as PropType<InputHTMLAttributes>,
  },
  emits: {
    confirm: (_: string) => true,
    cancel: () => true,
  },
  setup(props, { emit: $emit }) {
    const icon = computed(() => {
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
    });

    const modelValue = ref('');

    return () => (
      <div class="max-w-md rounded-lg bg-linear-to-b from-white to-gray-100 p-8 text-gray-700 shadow-xl">
        <form
          class="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            $emit('confirm', props.prompt ? `confirm:${modelValue.value}` : props.confirmValue);
          }}
        >
          <main class="flex items-center gap-4">
            <div
              class={[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                props.color === 'white' /*   */ && 'bg-gray-100 text-gray-400',
                props.color === 'gray' /*    */ && 'bg-gray-100 text-gray-800',
                props.color === 'green' /*   */ && 'bg-green-100 text-green-800',
                props.color === 'red' /*     */ && 'bg-red-100 text-red-800',
                props.color === 'blue' /*    */ && 'bg-blue-100 text-blue-800',
                props.color === 'yellow' /*  */ && 'bg-yellow-100 text-yellow-800',
              ]}
            >
              <span class={[icon.value, 'h-6 w-6']}></span>
            </div>

            <div class="flex flex-col gap-2">
              <p class="text-sm whitespace-pre-wrap">{props.message}</p>
              {props.prompt && (
                <input
                  v-model={modelValue.value}
                  class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
                  {...props.prompt}
                  autofocus
                  required
                />
              )}
            </div>
          </main>

          <footer class="flex items-center justify-center gap-4">
            <MyButton type="submit" autofocus color={props.color}>
              <span class="capitalize">{props.confirmText}</span>
            </MyButton>
            {props.cancelText && (
              <MyButton type="button" color="white" onClick={() => $emit('cancel')}>
                <span class="capitalize">{props.cancelText}</span>
              </MyButton>
            )}
          </footer>
        </form>
      </div>
    );
  },
});
