import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { MyButton } from '@/component/button/MyButton';
import { cn } from '~/lib/cn';

import { borderColor, iconClass, iconColorClass, type ReactComponent } from './_plugin';
import {
  DialogContext,
  type AlertOptions,
  type ConfirmOptions,
  type DialogContent,
  type WindowDialogAlertOptions,
  type WindowDialogConfirmOptions,
  type WindowDialogOptions,
} from './dialogContext';

export default function DialogProvider({ children }: { children: ReactNode }) {
  // oxlint-disable-next-line typescript/no-explicit-any
  const [items, setItems] = useState<DialogContentInner<any, ReactComponent>[]>([]);
  const idRef = useRef(0);

  const removeDialog = useCallback((id: number) => {
    setItems((current) => current.filter((dialog) => dialog.id !== id));
  }, []);

  const showModal = useMemo(
    () =>
      <T, C extends ReactComponent>(args: DialogContent<T, C>) => {
        const id = ++idRef.current;
        return new Promise<T>((resolve, reject) => {
          setItems((current) => [...current, { id, resolve, reject, ...args }]);
        });
      },
    [],
  );

  const showWindowDialog = useMemo(
    () =>
      <T extends string>(message: string, options?: WindowDialogOptions) => {
        return showModal<T, typeof WindowDialog>({
          Component: WindowDialog,
          $props: (resolve, reject) => ({
            message,
            ...options,
            onConfirm: (value) => resolve(value as T),
            onCancel: () => reject(),
          }),
        });
      },
    [showModal],
  );

  const loading = useMemo(
    () =>
      <T extends string>() => {
        const id = ++idRef.current;
        void new Promise<T>((resolve, reject) => {
          setItems((current) => [
            ...current,
            {
              id,
              resolve,
              reject,
              Component: LoadingDialog,
              options: {
                closedby: 'none',
                showCloseButton: false,
              },
            },
          ]);
        });

        return {
          close: () => {
            (document.getElementById(`dialog-${id}`) as HTMLDialogElement | null)?.close();
          },
        };
      },
    [],
  );

  const api = useMemo(
    () => ({
      showModal,
      loading,

      get alert() {
        return {
          async open(
            message: string,
            { confirmText = 'OK', ...options }: WindowDialogAlertOptions = {},
          ) {
            return showWindowDialog<'confirm' | 'cancel'>(message, { confirmText, ...options });
          },
          async success(message: string, options: AlertOptions = {}) {
            return this.open(message, { set: 'positive', ...options });
          },
          async info(message: string, options: AlertOptions = {}) {
            return this.open(message, { set: 'info', ...options });
          },
          async warn(message: string, options: AlertOptions = {}) {
            return this.open(message, { set: 'warning', ...options });
          },
          async danger(message: string, options: AlertOptions = {}) {
            return this.open(message, { set: 'danger', ...options });
          },
        };
      },
      get confirm() {
        return {
          async open(
            message: string,
            { confirmText = 'YES', cancelText = 'NO', ...options }: WindowDialogConfirmOptions = {},
          ) {
            return showWindowDialog<'YES' | 'cancel'>(message, {
              confirmText,
              cancelText,
              confirmValue: 'YES',
              ...options,
            });
          },
          async success(message: string, options: ConfirmOptions = {}) {
            return this.open(message, { set: 'positive', ...options });
          },
          async info(message: string, options: ConfirmOptions = {}) {
            return this.open(message, { set: 'info', ...options });
          },
          async warn(message: string, options: ConfirmOptions = {}) {
            return this.open(message, { set: 'warning', ...options });
          },
          async danger(message: string, options: ConfirmOptions = {}) {
            return this.open(message, { set: 'danger', ...options });
          },
        };
      },
    }),
    [showModal, showWindowDialog, loading],
  );

  return (
    <DialogContext.Provider value={api}>
      {children}

      {items.map((dialogContent) => (
        <DialogContainer
          key={dialogContent.id}
          {...dialogContent}
          onClose={() => removeDialog(dialogContent.id)}
        />
      ))}
    </DialogContext.Provider>
  );
}

type DialogContentInner<T, C extends ReactComponent> = DialogContent<T, C> & {
  id: number;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

function DialogContainer<T, C extends ReactComponent>({
  id,
  onClose,
  Component,
  resolve,
  reject,
  $props,
  options,
}: {
  onClose: () => void;
} & DialogContentInner<T, C>) {
  useEffect(() => {
    (document.getElementById(`dialog-${id}`) as HTMLDialogElement | null)?.showModal();
  }, [id]);

  const trapResolve = useCallback(
    (value: T | PromiseLike<T>) => {
      (document.getElementById(`dialog-${id}`) as HTMLDialogElement | null)?.close();
      resolve(value);
    },
    [resolve, id],
  );

  const trapReject = useCallback(
    (reason?: unknown) => {
      (document.getElementById(`dialog-${id}`) as HTMLDialogElement | null)?.close();
      reject(reason);
    },
    [reject, id],
  );

  const componentProps = useMemo(
    () => ($props ? $props(trapResolve, trapReject) : ({} as ComponentProps<C>)),
    [$props, trapResolve, trapReject],
  );

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = document.getElementById(`dialog-${id}`) as HTMLDialogElement | null;
    if (!dialog) {
      return;
    }

    const handleClose = () => {
      const timerId = setTimeout(() => {
        onCloseRef.current();
      }, 250);

      dialog.addEventListener(
        'transitionend',
        (e) => {
          if (e.target === dialog) {
            clearTimeout(timerId);
            onCloseRef.current();
          }
        },
        { once: true },
      );

      reject(dialog.returnValue || 'cancel');
    };

    dialog.addEventListener('close', handleClose, { once: true });

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [reject, id]);

  useEffect(() => {
    function closeDialog(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation(); // App.tsx の hideWindow に突き抜けないようにする
      }
    }
    function preventContextMenu(e: MouseEvent) {
      e.stopPropagation();
    }

    window.addEventListener('keydown', closeDialog, true);
    window.addEventListener('contextmenu', preventContextMenu, true);

    return () => {
      window.removeEventListener('keydown', closeDialog, true);
      window.removeEventListener('contextmenu', preventContextMenu, true);
    };
  });

  const style = useMemo(() => {
    const style: CSSProperties = {};
    if (options?.fixed) {
      const fixed = options?.fixed;

      style.margin = '0'; // マージで中の要素を中央寄せしているので消す
      style.insetInlineStart = 'unset'; // 消すと right: が効くようになる
      style.insetBlockStart = 'unset'; // 消すと bottom: が効くようになる
      style.position = 'fixed';

      if (window.innerWidth >= fixed.position.left + fixed.width) {
        style.left = `${fixed.position.left}px`;
      } else {
        style.right = 'calc(4px + var(--spacing) * 1.5)'; // scrollbar 分
      }

      if (window.innerHeight >= fixed.position.top + fixed.height) {
        style.top = `${fixed.position.top}px`;
      } else {
        style.bottom = `${window.innerHeight - fixed.position.bottom}px`;
      }
    }

    return style;
  }, [options?.fixed]);

  return (
    <dialog
      id={`dialog-${id}`}
      style={style}
      className={cn([
        'm-auto max-h-dvh max-w-dvw overflow-visible bg-transparent outline-hidden',
        'transition transition-discrete duration-200 ease-out',
        'scale-95 opacity-0',
        'starting:[[open]]:scale-95 starting:[[open]]:opacity-0',
        '[[open]]:scale-100 [[open]]:opacity-100',
        'backdrop:bg-gray-500/20',
        options?.fixed ? 'backdrop:backdrop-grayscale-xs' : 'backdrop:backdrop-blur-xs',
        'backdrop:transition backdrop:transition-discrete backdrop:duration-200 backdrop:ease-out',
        'backdrop:opacity-0',
        'starting:[[open]]:backdrop:opacity-0',
        '[[open]]:backdrop:opacity-100',
      ])}
      closedby={options?.closedby ?? 'any'}
    >
      <Component {...componentProps} />

      {options?.showCloseButton !== false && (
        <button
          type="button"
          aria-label="Close"
          className={cn(
            'absolute top-1 right-1 size-6 cursor-pointer transition',
            'inline-flex items-center justify-center',
            'rounded-full outline-none hover:ring-1 focus:ring-2',
            'bg-transparent shadow',
            'text-slate-400',
            'hover:bg-white hover:ring-slate-400',
            'focus:bg-white focus:ring-slate-400',
            'dark:text-zinc-500',
            'dark:hover:bg-zinc-700 dark:hover:ring-zinc-500',
            'dark:focus:bg-zinc-700 dark:focus:ring-zinc-500',
          )}
          onClick={() => trapReject()}
        >
          <span className="icon-[bi--x] size-5"></span>
        </button>
      )}
    </dialog>
  );
}

export type WindowDialogProps = WindowDialogOptions & {
  message: string;
  onConfirm: (value: string) => void;
  onCancel: (reason?: unknown) => void;
};

function WindowDialog({
  message,
  set = 'default',
  confirmText = 'confirm',
  confirmValue = 'confirm',
  cancelText,
  onConfirm,
  onCancel,
}: WindowDialogProps) {
  return (
    <div
      className={cn(
        'max-w-120 rounded-lg p-8 shadow-md',
        'text-sm',
        'bg-white text-slate-900',
        'dark:bg-zinc-900 dark:text-zinc-100',
        'border',
        borderColor(set),
      )}
    >
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(confirmValue);
        }}
      >
        <main className="flex items-center gap-4">
          <div className={`inline-flex shrink-0 items-center justify-center rounded-full`}>
            <span className={cn('size-6', iconClass(set), iconColorClass(set))} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          </div>
        </main>

        <footer className="flex items-center justify-center gap-4">
          <MyButton type="submit" set={set} variant="contained">
            <span className="capitalize">{confirmText}</span>
          </MyButton>
          {cancelText && (
            <MyButton type="button" set="default" variant="outlined" onClick={() => onCancel()}>
              <span className="capitalize">{cancelText}</span>
            </MyButton>
          )}
        </footer>
      </form>
    </div>
  );
}

function LoadingDialog() {
  return (
    <div className="flex flex-col items-center bg-transparent p-8">
      <span className="icon-[eos-icons--bubble-loading] text-opacity-60 h-16 w-16 text-gray-600"></span>
      <span className="sr-only">Loading...</span>
      <input
        autoFocus
        name="loading"
        className="h-0 w-0 border-none bg-transparent caret-transparent outline-hidden"
      />
    </div>
  );
}
