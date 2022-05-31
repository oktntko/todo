import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FcGenericSortingDesc } from "react-icons/fc";
import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import { NoData, Progress } from "~/components/Table";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function CategoryIndexPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<components["schemas"]["CategoryResponse"][]>([]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = () => {
    setLoading(true);

    api.get
      .categories()
      .then(({ data }) => {
        setCategories(data.categories);
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <div className="mx-auto my-4 w-full max-w-screen-sm space-y-2 px-6">
        <div className={"relative overflow-x-auto shadow-md"}>
          <DataTable
            data={categories}
            columns={[
              {
                name: "ID",
                selector: (row) => row.category_id,
                sortable: true,
                cell: (row) => (
                  <NavLink
                    to={`/categories/${row.category_id}`}
                    className={"text-blue-600 underline"}
                  >{`#${row.category_id}`}</NavLink>
                ),
                maxWidth: "64px",
              },
              { name: "カテゴリ名", selector: (row) => row.category_name, sortable: true },
            ]}
            highlightOnHover
            progressPending={loading}
            progressComponent={<Progress />}
            noDataComponent={<NoData />}
            sortIcon={<FcGenericSortingDesc />}
          />
        </div>
      </div>
      <button
        type="button"
        className="fixed bottom-16 right-24 h-20 w-20 rounded-full bg-blue-600 p-0 text-white shadow-md lg:right-[24%] 2xl:right-[32%]"
        onClick={() => navigate("/categories/add")}
      >
        追加
      </button>
    </>
  );
}
