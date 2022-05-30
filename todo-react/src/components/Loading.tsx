import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ImSpinner8 } from "react-icons/im";

export const Loading = ({ loading }: { loading: boolean }) => {
  return (
    <Transition show={loading} as={Fragment}>
      {/* 画面全体に広がる。flexにして子要素が中心になるように調整 */}
      <Dialog
        as="div"
        className={`fixed inset-0 z-10 flex
          flex-col items-center justify-center overflow-hidden`}
        onClose={() => ({})}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out transition-opacity duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-out transition-opacity duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* 背景 */}
          <Dialog.Overlay className="fixed inset-0 bg-slate-200/50 backdrop-blur-[2px]" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease transition-opacity duration-50"
          enterFrom="opacity-0 scale-[0.8]"
          enterTo="opacity-100 scale-100"
          leave="ease transition-opacity duration-50"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-[0.8]"
        >
          <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
            {/* ローディング */}
            <div className="flex animate-spin justify-center">
              <ImSpinner8 className="text-[4rem] text-slate-200" />
            </div>
            {/* focusできる要素がないとwarningになるため */}
            <input className="sr-only" />
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
