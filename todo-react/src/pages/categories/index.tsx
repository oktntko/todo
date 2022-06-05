import { useEffect, useState } from "react";
import { AiFillTag } from "react-icons/ai";
import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import { Table } from "~/components/Table";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function CategoryIndexPage() {
  const navigate = useNavigate();

  const { loading, categories } = useCategories();

  return (
    <>
      <div className="mx-auto my-4 w-full max-w-screen-sm space-y-2 px-6">
        <Table
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
            {
              name: "",
              cell: (row) => <AiFillTag style={{ color: row.color }} className="text-2xl" />,
              maxWidth: "32px",
            },
            { name: "カテゴリ名", selector: (row) => row.category_name, sortable: true },
          ]}
          progressPending={loading}
        />
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

const useCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<components["schemas"]["CategoryResponse"][]>([]);

  const getCategories = () => {
    setLoading(true);
    return api.get.categories().finally(() => setLoading(false));
  };

  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data.categories));
  }, []);

  return { loading, categories };
};
