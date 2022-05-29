import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";

export const Overlay = ({
  children,
  display,
  onClickOverlay,
  afterLeave,
}: {
  children: React.ReactNode;
  display: boolean;
  onClickOverlay?: (value: boolean) => void;
  afterLeave?: () => void;
}) => {
  return (
    <Transition show={display} as={Fragment}>
      {/* 画面全体に広がる。flexにして子要素が中心になるように調整 */}
      <Dialog
        className={`fixed inset-0 z-10 flex
          flex-col items-center justify-center overflow-hidden`}
        onClose={(value) => (onClickOverlay ? onClickOverlay(value) : () => ({}))}
      >
        <Transition.Child
          enter="linear transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="linear transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* 背景 */}
          <Dialog.Overlay className="fixed inset-0 bg-slate-800/50 backdrop-blur-[2px]" />
        </Transition.Child>

        <Transition.Child
          enter="ease transition-opacity duration-200"
          enterFrom="opacity-0 scale-[0.8]"
          enterTo="opacity-100 scale-100"
          leave="ease transition-opacity duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-[0.8]"
          afterLeave={afterLeave}
        >
          <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">{children}</div>
          {/* focusできる要素がないとwarningになるため */}
          <input className="sr-only" />
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
