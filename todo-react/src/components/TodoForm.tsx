import { Listbox, Transition } from "@headlessui/react";
import { Field, Form, Formik, useField } from "formik";
import { Fragment, memo, useCallback, useEffect, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { HiSelector } from "react-icons/hi";
import { MdClear } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Loading } from "~/components/Loading";
import { code } from "~/plugins/code";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function TodoForm({ todo_id }: { todo_id?: string | undefined }) {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<components["schemas"]["Category"][]>([]);
  const [initialValues, setInitialValues] = useState({
    yarukoto: "",
    category_id: undefined as number | undefined,
    kizitu: "" as string | undefined,
    yusendo: "" as string | undefined,
    subcategory_id_list: [] as number[],
    memo: "" as string | undefined,
    updated_at: "",
  });

  const { loading, getTodo, postTodo, putTodo, deleteTodo } = useTodo();

  useEffect(() => {
    api.get.categories().then(({ data }) => {
      setCategories(data.categories);
    });

    if (todo_id) {
      getTodo(todo_id).then(({ data }) =>
        setInitialValues({
          ...initialValues,
          ...data,
          subcategory_id_list: data.subcategories.map((category) => category.category_id),
        })
      );
    }
  }, [todo_id]);

  const handleSubmit = useCallback(
    (values: typeof initialValues) => {
      if (todo_id) {
        putTodo(todo_id, values).then(() => navigate("/todos"));
      } else {
        postTodo(values).then(() => navigate("/todos"));
      }
    },
    [todo_id]
  );

  const handleDelete = useCallback(
    (todo_id: string, values: typeof initialValues) => {
      deleteTodo(todo_id, values).then(() => navigate("/todos"));
    },
    [todo_id]
  );

  return (
    <>
      <Loading loading={loading} />
      <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
        {({ values }) => (
          <Form>
            <div className="my-4 mx-auto w-full max-w-screen-sm space-y-2 px-6">
              {/* １行目 */}
              <div className="space-y-2">
                <Field
                  name="yarukoto"
                  placeholder="やること"
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  required
                />

                {/* ２行目 */}
                <div className="flex space-x-2">
                  <CategoryList name="category_id" categories={categories} />

                  <div className="relative">
                    <Field
                      name="kizitu"
                      placeholder="期日"
                      type="date"
                      className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <YusendoList name="yusendo" />
                </div>
                {/* ３行目 */}
                <SubcategoryList name="subcategory_id_list" categories={categories} />
                {/* ４行目 */}
                <Field
                  as="textarea"
                  name="memo"
                  placeholder="メモ"
                  rows={4}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                ></Field>
              </div>
            </div>
            {/* フォームボタン */}
            <div className="my-4 mx-auto flex w-full max-w-screen-sm justify-end space-x-2 px-6">
              {todo_id && (
                <button
                  type="button"
                  className="my-1 rounded-lg border border-yellow-400 px-5 py-2 text-center text-sm font-medium text-yellow-400 hover:bg-yellow-500 hover:text-white focus:outline-none focus:ring-1 focus:ring-yellow-300 dark:border-yellow-300 dark:bg-green-600 dark:text-yellow-300 dark:hover:bg-yellow-400 dark:hover:text-white dark:focus:ring-yellow-900"
                  onClick={() => handleDelete(todo_id, values)}
                >
                  削除
                </button>
              )}
              <button
                type="submit"
                className="my-1 rounded-lg bg-green-600 px-5 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                {todo_id ? "保存" : "登録"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
}

const useTodo = () => {
  const [loading, setLoading] = useState(false);

  const getTodo = useCallback((todo_id: string) => {
    setLoading(true);
    return api.get.todo({ todo_id }).finally(() => setLoading(false));
  }, []);

  const postTodo = useCallback((todo: components["schemas"]["TodoBody"]) => {
    setLoading(true);
    return api.post.todos(todo).finally(() => setLoading(false));
  }, []);

  const putTodo = useCallback(
    (todo_id: string, todo: components["schemas"]["TodoBody"] & Version) => {
      setLoading(true);
      return api.put.todos({ todo_id }, todo).finally(() => setLoading(false));
    },
    []
  );

  const deleteTodo = useCallback((todo_id: string, version: Version) => {
    setLoading(true);
    return api.delete.todos({ todo_id }, version).finally(() => setLoading(false));
  }, []);

  return {
    loading,
    getTodo,
    postTodo,
    putTodo,
    deleteTodo,
  };
};

const CategoryList = memo(function CategoryList(props: {
  name: string;
  categories: components["schemas"]["Category"][];
}) {
  const [field] = useField({ name: props.name });

  return (
    <div className="relative grow">
      <Listbox
        value={field.value}
        onChange={(value) => {
          field.onChange({ target: { name: field.name, value } });
        }}
      >
        <Listbox.Button
          className={`${
            field.value ? "text-gray-900" : "text-gray-400"
          } block min-h-[2.6rem] w-full rounded-lg border border-gray-300 bg-white p-2.5 text-left text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
        >
          <span>
            {field.value
              ? props.categories.find((category) => field.value === category.category_id)
                  ?.category_name
              : "カテゴリ"}
          </span>
        </Listbox.Button>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <button
            type="button"
            onClick={() => field.onChange({ target: { name: field.name, value: undefined } })}
          >
            <MdClear className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </button>
          <HiSelector className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
        <Transition
          as={Fragment}
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Listbox.Options className="absolute z-10 w-full overflow-auto rounded-md bg-white p-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {props.categories.map((category) => {
              return (
                <Listbox.Option
                  key={category.category_id}
                  value={category.category_id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                      >
                        {category.category_name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
});

const YusendoList = memo(function YusendoList({ name }: { name: string }) {
  return (
    <div className="flex items-center space-x-2">
      {code.yusendo.map((yusendo, i) => {
        return (
          <div key={i}>
            <Field
              name={name}
              type="radio"
              value={yusendo.value}
              id={`yusendo_${i}`}
              className="h-4 w-4 border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            />
            <label
              htmlFor={`yusendo_${i}`}
              className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              <span>{yusendo.label}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
});

const SubcategoryList = memo(function SubcategoryList(props: {
  name: string;
  categories: components["schemas"]["Category"][];
}) {
  const [field] = useField({ name: props.name });

  return (
    <div className="relative">
      <Listbox
        value={field.value}
        onChange={(value) => {
          field.onChange({ target: { name: field.name, value } });
        }}
        multiple
      >
        <Listbox.Button
          className={`${
            field.value.length ? "text-gray-900" : "text-gray-400"
          } block min-h-[2.6rem] w-full rounded-lg border border-gray-300 bg-white p-2.5 text-left text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
        >
          <span>
            {field.value.length
              ? props.categories
                  .filter((category) => ~field.value.indexOf(category.category_id))
                  .map((category) => category.category_name)
                  .join(", ")
              : "サブカテゴリ"}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <HiSelector className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Listbox.Options className="absolute z-10 w-full overflow-auto rounded-md bg-white p-2 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {props.categories.map((category) => {
              return (
                <Listbox.Option
                  key={category.category_id}
                  value={category.category_id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                      >
                        {category.category_name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
});
