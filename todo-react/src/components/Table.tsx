import { ReactNode } from "react";

type HeaderNode = (column: Column) => ReactNode;
type CellNode = (value?: any, row?: any, column?: Column) => ReactNode;

export type Column = {
  accessor: string;
  HeaderClassName?: string;
  Header?: string | HeaderNode;
  CellClassName?: string;
  Cell?: string | CellNode;
  Footer?: () => ReactNode | string;
};

export const Table = ({ columns, rows }: { columns: Column[]; rows: any[] }) => {
  return (
    <div className="flex justify-center">
      <div className="container m-2 p-2">
        <div className="relative overflow-x-auto shadow-md">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                {columns?.map((column) => {
                  return (
                    <th
                      key={column.accessor}
                      scope="col"
                      className={column.HeaderClassName ?? "px-6 py-3"}
                    >
                      {!column.Header
                        ? column.accessor
                        : typeof column.Header === "string"
                        ? column.Header
                        : column.Header(column)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows?.map((row, i) => {
                return (
                  <tr
                    key={i}
                    className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                  >
                    {columns?.map((column) => {
                      return (
                        <td key={column.accessor} className={column.CellClassName ?? "px-6 py-4"}>
                          {!column.Cell
                            ? row[column.accessor]
                            : typeof column.Cell === "string"
                            ? column.Cell
                            : column.Cell(row[column.accessor], row, column)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
