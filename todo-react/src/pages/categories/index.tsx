import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import { Loading } from "~/components/Loading";
import { Table } from "~/components/Table";
import { api } from "~/repositories/api";
import { paths } from "~/repositories/schema";

export const CategoryIndexPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<
    paths["/api/categories"]["get"]["responses"]["200"]["content"]["application/json"]["categories"]
  >([]);

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
      <Loading loading={loading} />
      <div className="mx-auto my-4 w-full max-w-screen-sm space-y-2 px-6">
        <Table
          columns={[
            {
              accessor: "category_id",
              HeaderClassName: "w-4 px-6 py-3",
              Header: "ID",
              Cell: (value?: any) => {
                return (
                  <NavLink
                    to={`/categories/${value}`}
                    className={"text-blue-600 underline"}
                  >{`#${value}`}</NavLink>
                );
              },
            },
            { accessor: "category_name", Header: "カテゴリ名" },
          ]}
          rows={categories}
          loading={loading}
        />
      </div>
      <button
        className="fixed bottom-16 right-24 h-20 w-20 rounded-full bg-blue-600 p-0 text-white shadow-md lg:right-[24%] 2xl:right-[32%]"
        onClick={() => navigate("/categories/add")}
      >
        追加
      </button>
    </>
  );
};
