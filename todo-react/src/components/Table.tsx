import React, { ReactNode } from "react";

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

export const Table = ({
  columns,
  rows,
  loading,
}: {
  columns: Column[];
  rows: any[];
  loading?: boolean;
}) => {
  const MainContents = () => {
    if (loading) {
      // ローディング中
      return (
        <div className="flex justify-center">
          <div className="container">
            <div className="relative overflow-x-auto shadow-md">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    {columns?.map((column) => {
                      return (
                        <th
                          key={column.accessor}
                          scope="col"
                          className={`h-10 ${column.HeaderClassName ?? "px-3 py-3"}`}
                        ></th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((row, i) => {
                    return (
                      <tr
                        key={i}
                        className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                      >
                        {columns?.map((column) => {
                          return (
                            <td
                              key={column.accessor}
                              className={`h-10 ${column.CellClassName ?? "px-3 py-3"}`}
                            >
                              <p className="h-5 rounded bg-slate-200"></p>
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
    } else if (rows.length) {
      // データがあるあとき
      return (
        <div className="flex justify-center">
          <div className="container">
            <div className="relative overflow-x-auto shadow-md">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    {columns?.map((column) => {
                      return (
                        <th
                          key={column.accessor}
                          scope="col"
                          className={column.HeaderClassName ?? "px-3 py-3"}
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
                            <td
                              key={column.accessor}
                              className={column.CellClassName ?? "px-3 py-3"}
                            >
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
    } else {
      // データがないとき
      return (
        <div className="flex justify-center">
          <div className="container">
            <div className="relative overflow-x-auto shadow-md">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    {columns?.map((column) => {
                      return (
                        <th
                          key={column.accessor}
                          scope="col"
                          className={column.HeaderClassName ?? "px-3 py-3"}
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
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-6">
                      <p>該当データが存在しません</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
  };

  return <MainContents />;
};
