import { motion } from "framer-motion";
import DataTable, { TableProps } from "react-data-table-component";
import { AiFillWarning } from "react-icons/ai";
import { FcGenericSortingDesc } from "react-icons/fc";
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

export function Table<T>(props: TableProps<T>) {
  return (
    <div className={"relative overflow-x-auto shadow-md"}>
      <DataTable
        highlightOnHover
        progressComponent={<Progress />}
        noDataComponent={<NoData />}
        sortIcon={<FcGenericSortingDesc />}
        {...props}
      />
    </div>
  );
}
