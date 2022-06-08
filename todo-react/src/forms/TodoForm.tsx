import { Listbox, Transition } from "@headlessui/react";
import { Field, FieldInputProps, Form, Formik } from "formik";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Fragment, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AiFillTag, AiOutlineCheck } from "react-icons/ai";
import { HiSelector } from "react-icons/hi";
import { ImForward3, ImLast, ImPause2, ImPlay3, ImStop2 } from "react-icons/im";
import { MdClear } from "react-icons/md";
import { code } from "~/plugins/code";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function TodoForm({
  todo_id,
  onSuccess,
}: {
  todo_id?: string | undefined;
  onSuccess: (res: { data: components["schemas"]["TodoResponse"] }) => void;
}) {
  const { categories } = useCategory();

  const [initialValues, setInitialValues] = useState({
    yarukoto: "",
    status: "TODO" as "TODO" | "DOING" | "DONE",
    category_id: undefined as number | undefined,
    kizitu: "" as string | undefined,
    yusendo: "PLAY" as "FAST" | "SPEEDUP" | "PLAY" | "PAUSE" | "STOP",
    subcategory_id_list: [] as number[],
    memo: "" as string | undefined,
    updated_at: "",
  });

  const { getTodo, postTodo, putTodo, deleteTodo } = useTodo();

  useEffect(() => {
    if (todo_id) {
      getTodo(todo_id).then(({ data }) =>
        setInitialValues({
          ...initialValues,
          ...data,
        })
      );
    }
  }, [todo_id]);

  const handleSubmit = useCallback(
    (values: typeof initialValues) => {
      if (todo_id) {
        putTodo(todo_id, values).then(onSuccess);
      } else {
        postTodo(values).then(onSuccess);
      }
    },
    [todo_id]
  );

  const handleDelete = useCallback(
    (todo_id: string, values: typeof initialValues) => {
      deleteTodo(todo_id, values).then(onSuccess);
    },
    [todo_id]
  );

  return (
    <>
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
                  <Field name="category_id">
                    {({ field }: { field: FieldInputProps<number> }) => (
                      <div className="relative grow">
                        <CategoryListbox
                          value={field.value}
                          onChange={(value) =>
                            field.onChange({ target: { name: field.name, value } })
                          }
                          categories={categories}
                          placeholder={"カテゴリ"}
                        />
                      </div>
                    )}
                  </Field>

                  <div className="relative">
                    <Field
                      name="kizitu"
                      placeholder="期日"
                      type="date"
                      className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center">
                    <Field name="yusendo">
                      {({ field }: { field: FieldInputProps<typeof code.yusendo[number]> }) => (
                        <YusendoList
                          value={field.value}
                          onChange={(value) => {
                            field.onChange({ target: { name: field.name, value } });
                          }}
                        />
                      )}
                    </Field>
                  </div>
                </div>
                {/* ３行目 */}
                <Field name="subcategory_id_list">
                  {({ field }: { field: FieldInputProps<number[]> }) => (
                    <div className="relative">
                      <CategoryListbox
                        multiple
                        value={field.value}
                        onChange={(value) =>
                          field.onChange({ target: { name: field.name, value } })
                        }
                        categories={categories}
                        placeholder={"サブカテゴリ"}
                      />
                    </div>
                  )}
                </Field>
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

export const useCategory = () => {
  const [categories, setCategories] = useState<components["schemas"]["CategoryResponse"][]>([]);
  useEffect(() => {
    api.get.categories().then(({ data }) => {
      setCategories(data.categories);
    });
  }, []);

  return { categories };
};

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

export function YusendoList({
  value,
  onChange,
}: {
  value: typeof code.yusendo[number];
  onChange: (value: typeof code.yusendo[number]) => void;
}) {
  const controls = useAnimation();
  const handleClick = () => {
    const index = code.yusendo.findIndex((code) => code === value);
    const newvalue = index + 1 >= code.yusendo.length ? code.yusendo[0] : code.yusendo[index + 1];

    onChange(newvalue);
    controls.start({
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      transition: { duration: 0.5 },
    });
  };

  return (
    <motion.div animate={controls} onClick={handleClick} className="cursor-pointer">
      {value === "FAST" ? (
        <ImLast className="text-red-500" />
      ) : value === "SPEEDUP" ? (
        <ImForward3 className="text-yellow-500" />
      ) : value === "PLAY" ? (
        <ImPlay3 className="text-green-500" />
      ) : value === "PAUSE" ? (
        <ImPause2 className="text-gray-500" />
      ) : (
        <ImStop2 className="text-gray-500" />
      )}
    </motion.div>
  );
}

function CategoryListbox({
  multiple,
  value,
  onChange,
  categories,
  placeholder,
}: (
  | { multiple: true; value: number[]; onChange: (value: number[]) => void }
  | {
      multiple?: false | undefined;
      value: number | undefined;
      onChange: (value: number | undefined) => void;
    }
) & {
  categories: components["schemas"]["CategoryResponse"][];
  placeholder: string;
}) {
  const isNotEmpty = multiple ? value.length : value;

  return (
    <Listbox multiple={multiple} value={value} onChange={onChange}>
      <Listbox.Button
        className={`${
          isNotEmpty ? "text-gray-900" : "text-gray-400"
        } block min-h-[2.6rem] w-full rounded-lg border border-gray-300 bg-white p-2.5 text-left text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
      >
        <span>
          {isNotEmpty
            ? multiple
              ? categories
                  .filter((category) => ~value.indexOf(category.category_id))
                  .map((category) => category.category_name)
                  .join(", ")
              : categories.find((category) => value === category.category_id)?.category_name
            : placeholder}
        </span>
      </Listbox.Button>
      <span className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button type="button" onClick={() => (multiple ? onChange([]) : onChange(undefined))}>
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
          {categories.map((category) => {
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
                  <div className="flex items-center space-x-2">
                    <AiFillTag style={{ color: category.color }} className="shrink-0 text-2xl" />
                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                      {category.category_name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                        <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                )}
              </Listbox.Option>
            );
          })}
        </Listbox.Options>
      </Transition>
    </Listbox>
  );
}

export function TodoFormDialog({
  isVisible,
  todo_id,
  onSuccess,
}: {
  isVisible: boolean;
  todo_id?: string;
  onSuccess: (res: { data: components["schemas"]["TodoResponse"] }) => void;
}) {
  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-10 overflow-hidden bg-slate-200/50 backdrop-blur-[2px]`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { ease: "linear", duration: 0.2 } }}
        >
          <motion.div
            className="absolute right-0 h-full w-full max-w-screen-sm bg-white px-8 py-8 shadow"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TodoForm todo_id={todo_id} onSuccess={onSuccess} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.getElementById("outside")!
  );
}
