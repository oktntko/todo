import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Loading } from "~/components/Loading";
import { api } from "~/repositories/api";

export const CategoryForm = () => {
  const navigate = useNavigate();
  const { category_id } = useParams();
  const { loading, category, getCategory, setCategory, deleteCategory, putCategory, postCategory } =
    useCategory();

  useEffect(() => {
    if (category_id) {
      getCategory(category_id);
    }
  }, []);

  const handleChange =
    (name: keyof typeof category) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCategory({ ...category, [name]: e.target.value });
    };

  return (
    <>
      <Loading loading={loading} />
      <div className="my-4 mx-auto w-full max-w-screen-sm space-y-2 px-6">
        <div className="space-y-2">
          {/* １行目 */}
          <input
            placeholder="カテゴリ名"
            value={category.category_name ?? ""}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            required
            onChange={handleChange("category_name")}
          />
        </div>
      </div>
      <div className="my-4 mx-auto flex w-full max-w-screen-sm justify-end space-x-2 px-6">
        {category_id && (
          <button
            type="button"
            className="my-1 rounded-lg border border-yellow-400 px-5 py-2 text-center text-sm font-medium text-yellow-400 hover:bg-yellow-500 hover:text-white focus:outline-none focus:ring-1 focus:ring-yellow-300 dark:border-yellow-300 dark:bg-green-600 dark:text-yellow-300 dark:hover:bg-yellow-400 dark:hover:text-white dark:focus:ring-yellow-900"
            onClick={() => deleteCategory(category_id)?.then(() => navigate("/categories"))}
          >
            削除
          </button>
        )}
        {category_id && (
          <button
            type="button"
            className="my-1 rounded-lg bg-green-600 px-5 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={() => putCategory(category_id)?.then(() => navigate("/categories"))}
          >
            保存
          </button>
        )}
        {!category_id && (
          <button
            type="button"
            className="my-1 rounded-lg bg-green-600 px-5 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={() => postCategory()?.then(() => navigate("/categories"))}
          >
            登録
          </button>
        )}
      </div>
    </>
  );
};

const useCategory = () => {
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState({
    category_name: null as string | null,
    updated_at: null as string | null,
  });

  const getCategory = (category_id: string) => {
    setLoading(true);
    return api.get
      .category({ category_id })
      .then(({ data }) => {
        setCategory({ ...data });
        return data;
      })
      .finally(() => setLoading(false));
  };

  const postCategory = () => {
    if (!category.category_name) {
      alert("入力してください！");
      return;
    }

    setLoading(true);
    return api.post
      .categories({ category_name: category.category_name })
      .finally(() => setLoading(false));
  };

  const putCategory = (category_id: string) => {
    if (!category.category_name || !category.updated_at) {
      alert("入力してください！");
      return;
    }

    setLoading(true);
    return api.put
      .categories(
        { category_id },
        { category_name: category.category_name, updated_at: category.updated_at }
      )
      .finally(() => setLoading(false));
  };

  const deleteCategory = (category_id: string) => {
    if (!category.updated_at) {
      alert("入力してください！");
      return;
    }

    setLoading(true);
    return api.delete
      .categories({ category_id }, { updated_at: category.updated_at })
      .finally(() => setLoading(false));
  };

  return {
    loading,
    category,
    setCategory,
    getCategory,
    postCategory,
    putCategory,
    deleteCategory,
  };
};
