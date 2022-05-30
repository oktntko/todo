import { Listbox, Transition } from "@headlessui/react";
import type { ChangeEvent } from "react";
import { Fragment, useEffect, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { HiSelector } from "react-icons/hi";
import { MdClear } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { Loading } from "~/components/Loading";
import { code } from "~/plugins/code";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function TodoForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { todo_id } = useParams();

  const [categories, setCategories] = useState<components["schemas"]["Category"][]>([]);
  const [form, setForm] = useState({
    yarukoto: null as string | null,
    category_id: undefined as number | undefined,
    kizitu: undefined as string | undefined,
    yusendo: undefined as string | undefined,
    subcategory_id_list: [] as number[],
    memo: undefined as string | undefined,
    is_done: undefined as boolean | undefined,
    updated_at: undefined as string | undefined,
  });

  useEffect(() => {
    api.get.categories().then(({ data }) => {
      setCategories(data.categories);
    });

    if (todo_id) {
      getTodo(todo_id);
    }
  }, []);

  const handleChange =
    (name: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [name]: e.target.value });
    };
  const setCategoryId = (category_id: number | undefined) => {
    setForm({ ...form, category_id });
  };
  const setSubcategorIdList = (subcategory_id_list: number[]) => {
    setForm({ ...form, subcategory_id_list });
  };

  const getTodo = (todo_id: string) => {
    setLoading(true);

    api.get
      .todo({ todo_id })
      .then(({ data }) => {
        setForm({
          ...form,
          ...data,
          subcategory_id_list: data.subcategories.map((category) => category.category_id),
        });
      })
      .finally(() => setLoading(false));
  };

  const postTodos = () => {
    if (!form.yarukoto) {
      alert("入力してください！");
      return;
    }

    setLoading(true);
    api.post
      .todos({
        yarukoto: form.yarukoto,
        category_id: form.category_id,
        kizitu: form.kizitu,
        yusendo: form.yusendo,
        subcategory_id_list: form.subcategory_id_list,
        memo: form.memo,
      })
      .then(() => {
        navigate("/todos");
      })
      .finally(() => setLoading(false));
  };

  const putTodos = (todo_id: string) => {
    if (!form.yarukoto || !form.updated_at) {
      alert("入力してください！");
      return;
    }

    setLoading(true);
    api.put
      .todos(
        { todo_id },
        {
          yarukoto: form.yarukoto,
          category_id: form.category_id,
          kizitu: form.kizitu,
          yusendo: form.yusendo,
          subcategory_id_list: form.subcategory_id_list,
          memo: form.memo,
          updated_at: form.updated_at,
        }
      )
      .then(() => {
        navigate("/todos");
      })
      .finally(() => setLoading(false));
  };

  const deleteTodos = (todo_id: string) => {
    if (!form.updated_at) {
      alert("入力してください！");
      return;
    }

    setLoading(true);
    api.delete
      .todos({ todo_id }, { updated_at: form.updated_at })
      .then(() => {
        navigate("/todos");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Loading loading={loading} />
      <div className="my-4 mx-auto w-full max-w-screen-sm space-y-2 px-6">
        {/* １行目 */}
        <div className="space-y-2">
          <input
            placeholder="やること"
            value={form.yarukoto ?? ""}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            required
            onChange={handleChange("yarukoto")}
          />

          {/* ２行目 */}
          <div className="flex space-x-2">
            <CategoryList
              categories={categories}
              category_id={form.category_id}
              setCategoryId={setCategoryId}
            />

            <div className="relative">
              <input
                placeholder="期日"
                value={form.kizitu ?? ""}
                type="date"
                className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 pl-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                onChange={handleChange("kizitu")}
              />
            </div>

            <YusendoList value={form.yusendo ?? ""} onChange={handleChange("yusendo")} />
          </div>
          {/* ３行目 */}
          <SubcategoryList
            categories={categories}
            subcategory_id_list={form.subcategory_id_list}
            setSubcategorIdList={setSubcategorIdList}
          />
          {/* ４行目 */}
          <textarea
            placeholder="メモ"
            value={form.memo ?? ""}
            rows={4}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            onChange={handleChange("memo")}
          ></textarea>
        </div>
      </div>
      <div className="my-4 mx-auto flex w-full max-w-screen-sm justify-end space-x-2 px-6">
        {todo_id && (
          <button
            type="button"
            className="my-1 rounded-lg border border-yellow-400 px-5 py-2 text-center text-sm font-medium text-yellow-400 hover:bg-yellow-500 hover:text-white focus:outline-none focus:ring-1 focus:ring-yellow-300 dark:border-yellow-300 dark:bg-green-600 dark:text-yellow-300 dark:hover:bg-yellow-400 dark:hover:text-white dark:focus:ring-yellow-900"
            onClick={() => deleteTodos(todo_id)}
          >
            削除
          </button>
        )}
        {todo_id && (
          <button
            type="button"
            className="my-1 rounded-lg bg-green-600 px-5 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={() => putTodos(todo_id)}
          >
            保存
          </button>
        )}
        {!todo_id && (
          <button
            type="button"
            className="my-1 rounded-lg bg-green-600 px-5 py-2 text-center text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={postTodos}
          >
            登録
          </button>
        )}
      </div>
    </>
  );
}

function CategoryList({
  categories,
  category_id,
  setCategoryId,
}: {
  categories: components["schemas"]["Category"][];
  category_id: number | undefined;
  setCategoryId: (category_id: number | undefined) => void;
}) {
  return (
    <div className="relative grow">
      <Listbox value={category_id} onChange={setCategoryId}>
        <Listbox.Button
          className={`${
            category_id ? "text-gray-900" : "text-gray-400"
          } block min-h-[2.6rem] w-full rounded-lg border border-gray-300 bg-white p-2.5 text-left text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
        >
          <span>
            {category_id
              ? categories.find((category) => category_id === category.category_id)?.category_name
              : "カテゴリ"}
          </span>
        </Listbox.Button>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <button onClick={() => setCategoryId(undefined)}>
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
}

function YusendoList({
  value,
  onChange,
}: {
  value: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      {code.yusendo.map((yusendo, i) => {
        return (
          <div key={i}>
            <input
              name="yusendo"
              value={yusendo.value}
              checked={value === yusendo.value}
              id={`yusendo_${i}`}
              type="radio"
              className="h-4 w-4 border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
              onChange={onChange}
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
}

function SubcategoryList({
  categories,
  subcategory_id_list,
  setSubcategorIdList,
}: {
  categories: components["schemas"]["Category"][];
  subcategory_id_list: number[];
  setSubcategorIdList: (category_id: number[]) => void;
}) {
  return (
    <div className="relative">
      <Listbox value={subcategory_id_list} onChange={setSubcategorIdList} multiple>
        <Listbox.Button
          className={`${
            subcategory_id_list.length ? "text-gray-900" : "text-gray-400"
          } block min-h-[2.6rem] w-full rounded-lg border border-gray-300 bg-white p-2.5 text-left text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
        >
          <span>
            {subcategory_id_list.length
              ? categories
                  .filter((category) => ~subcategory_id_list.indexOf(category.category_id))
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
}
