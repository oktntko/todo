import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { ImSpinner8 } from "react-icons/im";

export function Loading({ loading }: { loading: boolean }) {
  return createPortal(
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-10 flex
            flex-col items-center justify-center overflow-hidden bg-slate-200/50 backdrop-blur-[2px]`}
        >
          <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
            <div className="flex animate-spin justify-center">
              <ImSpinner8 className="text-[4rem] text-slate-200" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.getElementById("portal")!
  );
}
