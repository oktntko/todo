import { Field, Form, Formik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Loading } from "~/components/Loading";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function CategoryForm({ category_id }: { category_id?: string | undefined }) {
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({ category_name: "", updated_at: "" });
  const { loading, getCategory, postCategory, putCategory, deleteCategory } = useCategory();

  useEffect(() => {
    if (category_id) {
      getCategory(category_id).then(({ data }) => setInitialValues(data));
    }
  }, [category_id]);

  const handleSubmit = useCallback(
    (values: typeof initialValues) => {
      if (category_id) {
        putCategory(category_id, values).then(() => navigate("/categories"));
      } else {
        postCategory(values).then(() => navigate("/categories"));
      }
    },
    [category_id]
  );

  const handleDelete = useCallback(
    (category_id: string, values: typeof initialValues) => {
      deleteCategory(category_id, values).then(() => navigate("/categories"));
    },
    [category_id]
  );

  return (
    <>
      <Loading loading={loading} />
      <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
        {({ values }) => (
          <Form>
            <div className="my-4 mx-auto w-full max-w-screen-sm space-y-2 px-6">
              <div className="space-y-2">
                {/* １行目 */}
                <Field
                  name="category_name"
                  placeholder="カテゴリ名"
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  required
                />
              </div>
              {/* フォームボタン */}
              <div className="my-4 mx-auto flex w-full max-w-screen-sm justify-end space-x-2 px-6">
                {category_id && (
                  <button
                    type="button"
                    className="my-1 rounded-lg border border-yellow-400 px-5 py-2 text-center text-sm font-medium text-yellow-400 hover:bg-yellow-500 hover:text-white focus:outline-none focus:ring-1 focus:ring-yellow-300 dark:border-yellow-300 dark:bg-green-600 dark:text-yellow-300 dark:hover:bg-yellow-400 dark:hover:text-white dark:focus:ring-yellow-900"
                    onClick={() => handleDelete(category_id, values)}
                  >
                    削除
                  </button>
                )}
                <button
                  type="submit"
                  className="my-1 rounded-lg bg-green-600 px-5 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                >
                  {category_id ? "保存" : "登録"}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}

const useCategory = () => {
  const [loading, setLoading] = useState(false);

  const getCategory = useCallback((category_id: string) => {
    setLoading(true);
    return api.get.category({ category_id }).finally(() => setLoading(false));
  }, []);

  const postCategory = useCallback((category: components["schemas"]["CategoryBody"]) => {
    setLoading(true);
    return api.post
      .categories({ category_name: category.category_name })
      .finally(() => setLoading(false));
  }, []);

  const putCategory = useCallback(
    (category_id: string, category: components["schemas"]["CategoryBody"] & Version) => {
      setLoading(true);
      return api.put.categories({ category_id }, category).finally(() => setLoading(false));
    },
    []
  );

  const deleteCategory = useCallback((category_id: string, version: Version) => {
    setLoading(true);
    return api.delete.categories({ category_id }, version).finally(() => setLoading(false));
  }, []);

  return {
    loading,
    getCategory,
    postCategory,
    putCategory,
    deleteCategory,
  };
};
