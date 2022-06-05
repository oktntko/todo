import { AxiosError } from "axios";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { AiFillCloseCircle, AiFillInfoCircle, AiFillWarning } from "react-icons/ai";
import { MdClear } from "react-icons/md";
import { Overlay } from "~/components/Overlay";

type CloseEventType = "escape" | "button" | "overlay";

export function Dialog({
  children,
  display,
  handleCloseEvent = ["escape", "button", "overlay"],
  onClose,
  afterLeave,
}: {
  children: ReactNode;
  display: boolean;
  handleCloseEvent?: CloseEventType | CloseEventType[];
  onClose?: () => void;
  afterLeave?: () => void;
}) {
  // Handle Close
  // "escape"
  if (!handleCloseEvent.includes("escape")) {
    useEffect(() => {
      const preventEscapeKeyHandler = (ev: KeyboardEvent) => {
        if (ev.key === "Escape") ev.preventDefault();
      };
      document.addEventListener("keydown", preventEscapeKeyHandler);

      return () => document.removeEventListener("keydown", preventEscapeKeyHandler);
    });
  }

  // "button"
  const canCloseButton = handleCloseEvent.includes("button");

  // "overlay"
  const canCloseOverlay = handleCloseEvent.includes("overlay");

  return (
    <Overlay
      display={display}
      onClickOverlay={canCloseOverlay && onClose ? () => onClose() : undefined}
      afterLeave={afterLeave}
    >
      <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
        {canCloseButton && onClose && (
          <button
            type="button"
            className="absolute top-3 right-2.5 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
            onClick={onClose}
          >
            <MdClear className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
        )}
        <div className="min-w-[16rem] px-6 py-4 text-center">{children}</div>
      </div>
    </Overlay>
  );
}

export function MessageDialog({
  display,
  onClose,
  afterLeave,
  title,
  level,
  message,
  onCancel,
  cancelText = "CANCEL",
  onConfirm,
  confirmText = "CONFIRM",
}: {
  display: boolean;
  onClose: () => void;
  afterLeave?: () => void;
  title?: string;
  level?: "INFO" | "WARN" | "ERROR";
  message: string;
  onCancel?: () => void;
  cancelText?: string;
  onConfirm?: () => void;
  confirmText?: string;
}) {
  return (
    <Dialog display={display} onClose={onClose} afterLeave={afterLeave}>
      {title && (
        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{title}</h3>
      )}
      <>
        {(() => {
          if (!level) return;

          switch (level) {
            case "INFO":
              return (
                <AiFillInfoCircle className="mx-auto mb-4 h-10 w-10 text-blue-500/80 dark:text-gray-200"></AiFillInfoCircle>
              );
            case "WARN":
              return (
                <AiFillWarning className="mx-auto mb-4 h-10 w-10 text-yellow-500/80 dark:text-gray-200"></AiFillWarning>
              );
            case "ERROR":
              return (
                <AiFillCloseCircle className="mx-auto mb-4 h-10 w-10 text-red-500/80 dark:text-gray-200"></AiFillCloseCircle>
              );
          }
        })()}
      </>
      {message && <h3 className="text-gray-500 dark:text-gray-400">{message}</h3>}
      {onCancel && (
        <button
          type="button"
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600"
          onClick={onCancel}
        >
          {cancelText}
        </button>
      )}
      {onConfirm && (
        <button
          type="button"
          className="mr-2 inline-flex items-center rounded-lg bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      )}
    </Dialog>
  );
}

export function AxiosErrorMessageDialog(props: {
  display: boolean;
  onClose: () => void;
  afterLeave?: () => void;
  axiosError?: AxiosError<{ message: string }, unknown> | null;
}) {
  const level = (() => {
    const status = props.axiosError?.response?.status ?? 0;
    if (0 < status && status < 400) {
      return "INFO";
    } else if (400 <= status && status < 500) {
      return "WARN";
    } else {
      return "ERROR";
    }
  })();

  return (
    <MessageDialog
      {...props}
      level={level}
      message={props.axiosError?.response?.data.message || ""}
    />
  );
}
