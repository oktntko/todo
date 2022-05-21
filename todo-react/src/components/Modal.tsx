import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function MyModal({
  children,
  display,
  setDisplay,
  onClose,
}: {
  children: JSX.Element;
  display: boolean;
  setDisplay: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: (value?: boolean | undefined) => void;
}) {
  const handleClose = (value: boolean) => {
    if (onClose) {
      onClose(value);
    } else {
      setDisplay(false);
    }
  };

  return (
    <Transition show={display} as={Fragment}>
      {/* 画面全体に広がる。flexにして子要素が中心になるように調整 */}
      <Dialog
        as="div"
        className={`fixed inset-0 z-10 flex
          flex-col items-center justify-center overflow-hidden`}
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="linear duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* 背景 */}
          <Dialog.Overlay className="fixed inset-0 bg-slate-800/50 backdrop-blur-[2px]" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease duration-200"
          enterFrom="opacity-0 scale-[0.8]"
          enterTo="opacity-100 scale-100"
          leave="ease duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-[0.8]"
        >
          <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
            {/* コンテンツ。アニメーションだけ。focusできる要素がないとwarningになる。 */}
            {children}
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
