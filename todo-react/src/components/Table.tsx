import { motion } from "framer-motion";
import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { ImSpinner8 } from "react-icons/im";

export function Progress() {
  return (
    <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="m-auto my-6 flex h-24 items-center justify-center"
      >
        <ImSpinner8 className="mb-4 h-10 w-10 animate-spin text-slate-200" />
      </motion.div>
    </div>
  );
}

export function NoData() {
  return (
    <div className="relative h-full w-full max-w-2xl p-4 md:h-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="m-auto my-6 flex h-24 items-center justify-center"
      >
        <AiFillWarning className="mb-4 h-10 w-10 text-yellow-500/80 dark:text-gray-200"></AiFillWarning>
        <h3 className="text-gray-500 dark:text-gray-400">データが見つかりません</h3>
      </motion.div>
    </div>
  );
}
