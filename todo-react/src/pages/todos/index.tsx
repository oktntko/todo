import { Listbox, Transition } from "@headlessui/react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { Fragment, memo, useCallback, useEffect, useState } from "react";
import { AiFillTag, AiOutlineCheck } from "react-icons/ai";
import { FaRegCheckCircle, FaRegCircle } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdDragHandle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Loading } from "~/components/Loading";
import { useCategory, YusendoList } from "~/forms/TodoForm";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function TodoIndexPage() {
  const navigate = useNavigate();

  const { categories } = useCategory();
  const { loading, todos, handleDone, handleReorder, handleChange } = useTodos();

  return (
    <>
      <Loading loading={loading} />
      {/* データがあるとき */}
      {!loading && todos.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Reorder.Group
            axis="y"
            onReorder={handleReorder}
            values={todos}
            className={`mx-auto my-4 w-full max-w-screen-sm space-y-2 px-8`}
          >
            {todos.map((todo) => (
              <TodoBox
                key={todo.todo_id}
                todo={todo}
                onDone={() => handleDone(todo.todo_id)}
                categories={categories}
                handleChange={handleChange}
              />
            ))}
          </Reorder.Group>
        </motion.div>
      )}
      {/* データがないとき */}
      {!loading && todos.length === 0 && (
        <div className={`mx-auto h-full w-full max-w-screen-sm space-y-2 px-6`}>
          <div className="flex h-full items-center justify-center">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: -50 }}>
              私は今、自由です🎉
            </motion.div>
          </div>
        </div>
      )}
      <button
        type="button"
        className="fixed bottom-16 right-24 h-20 w-20 rounded-full bg-blue-600 p-0 text-white shadow-md lg:right-[24%] 2xl:right-[32%]"
        onClick={() => navigate("/todos/add")}
      >
        追加
      </button>
    </>
  );
}

const useTodos = () => {
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<components["schemas"]["TodoResponse"][]>([]);

  const getTodos = useCallback(() => {
    setLoading(true);
    return api.get.todos().finally(() => setLoading(false));
  }, []);

  const handleDone = useCallback(
    (todo_id: number) => {
      setTodos(todos.filter((todo) => todo.todo_id !== todo_id));
      api.patch.todos.done({ todo_id: String(todo_id) });
    },
    [todos]
  );

  const handleReorder = useCallback(
    (todos: components["schemas"]["TodoResponse"][]) => {
      setTodos(todos);
      api.patch.todos.reorder({
        todos: todos.map(({ todo_id }, index) => {
          return { todo_id, order: index };
        }),
      });
    },
    [todos]
  );

  const handleChange = useCallback(
    (
      todo_id: number,
      key: keyof components["schemas"]["TodoResponse"],
      state: components["schemas"]["TodoResponse"][keyof components["schemas"]["TodoResponse"]]
    ) => {
      const index = todos.findIndex((todo) => todo.todo_id === todo_id);
      const updatedTodo = { ...todos[index], [key]: state };
      setTodos(todos.map((todo, i) => (i === index ? updatedTodo : todo)));
      api.patch.todos.one({ todo_id: String(todo_id) }, updatedTodo);
    },
    [todos]
  );

  useEffect(() => {
    getTodos().then(({ data }) => setTodos(data.todos));
  }, []);

  return { loading, todos, handleDone, handleReorder, handleChange };
};

const TodoBox = memo(function TodoBox({
  todo,
  onDone,
  categories,
  handleChange,
}: {
  todo: components["schemas"]["TodoResponse"];
  onDone: (todo_id: number) => void;
  categories: components["schemas"]["CategoryResponse"][];
  handleChange: (
    todo_id: number,
    key: keyof components["schemas"]["TodoResponse"],
    state: components["schemas"]["TodoResponse"][keyof components["schemas"]["TodoResponse"]]
  ) => void;
}) {
  const navigate = useNavigate();
  const dragControls = useDragControls();
  const [isHover, setIsHover] = useState(false);

  return (
    <Reorder.Item
      value={todo}
      id={String(todo.category_id)}
      className={`rounded border bg-white px-4 py-2 shadow-md dark:border-gray-700 dark:bg-gray-800`}
      dragListener={false}
      dragControls={dragControls}
    >
      <div className="flex flex-row space-x-2" style={{ userSelect: "none" }}>
        {/* 左側 */}
        <div className="flex grow flex-col space-y-3 ">
          {/* １行目 */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="font-bold uppercase">{todo.status}</div>
            <div className="flex items-center">
              <CategoryListbox
                value={todo.category_id}
                categories={categories}
                onChange={(category_id) => {
                  handleChange(todo.todo_id, "category_id", category_id);
                }}
              />
            </div>

            <input
              value={todo.kizitu}
              name="kizitu"
              placeholder="期日"
              type="date"
              className="focus:outline-none"
              onKeyDown={(e) => e.preventDefault()}
              onChange={(e) => {
                handleChange(todo.todo_id, "kizitu", e.target.value);
              }}
            />

            <YusendoList
              value={todo.yusendo}
              onChange={(value) => {
                handleChange(todo.todo_id, "yusendo", value);
              }}
            ></YusendoList>
          </div>
          {/* ２行目 */}
          <input
            value={todo.yarukoto}
            name="yarukoto"
            placeholder="やること"
            className="flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-gray-700 focus:outline-none"
            onChange={(e) => {
              handleChange(todo.todo_id, "yarukoto", e.target.value);
            }}
          />
          {/* ３行目 */}
          <div className="">
            <CategoryListbox
              multiple
              value={todo.subcategory_id_list}
              categories={categories}
              onChange={(subcategory_id_list) => {
                handleChange(todo.todo_id, "subcategory_id_list", subcategory_id_list);
              }}
            />
          </div>
        </div>
        {/* 右側 */}
        <div
          onPointerDown={(event) => dragControls.start(event)}
          className="flex flex-col items-stretch"
        >
          <HiDotsHorizontal
            className="cursor-pointer text-xl text-gray-600"
            onClick={() => navigate(`/todos/${todo.todo_id}`)}
          />
          <div
            onPointerDown={(event) => dragControls.start(event)}
            className="flex grow cursor-move items-center"
          >
            <MdDragHandle className="text-xl text-gray-500" />
          </div>
          <div onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
            {isHover ? (
              <FaRegCheckCircle
                className="cursor-pointer text-xl text-green-500"
                onClick={() => onDone(todo.todo_id)}
              />
            ) : (
              <FaRegCircle
                className="cursor-pointer text-xl text-gray-500"
                onClick={() => onDone(todo.todo_id)}
              />
            )}
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
});

function CategoryListbox({
  multiple,
  value,
  onChange,
  categories,
}: (
  | { multiple: true; value: number[]; onChange: (value: number[]) => void }
  | {
      multiple?: false | undefined;
      value: number | undefined;
      onChange: (value: number | undefined) => void;
    }
) & {
  categories: components["schemas"]["CategoryResponse"][];
}) {
  const isNotEmpty = multiple ? value.length : value;

  return (
    <Listbox multiple={multiple} value={value} onChange={onChange}>
      <Listbox.Button>
        <ListboxButton />
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
        <div className="absolute text-xs">
          <Listbox.Options
            className={
              "absolute top-2 z-10 block max-w-[360px] truncate rounded-md bg-white shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none"
            }
          >
            {categories.map((category) => {
              return (
                <Listbox.Option
                  key={category.category_id}
                  value={category.category_id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-1 pl-6 pr-2 ${
                      active ? "bg-amber-100 text-amber-900" : "text-gray-500"
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center space-x-2">
                      <AiFillTag style={{ color: category.color }} className="shrink-0" />
                      <span
                        className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                      >
                        {category.category_name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-1 text-amber-600">
                          <AiOutlineCheck aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      </Transition>
    </Listbox>
  );

  function ListboxButton() {
    if (isNotEmpty) {
      if (multiple) {
        return (
          <div className={"flex flex-wrap items-center space-x-1 text-xs"}>
            {categories
              // eslint-disable-next-line react/prop-types
              .filter((category) => ~value.indexOf(category.category_id))
              .map((category) => {
                return (
                  <div key={category.category_id} className={"flex items-center space-x-1 text-xs"}>
                    <AiFillTag style={{ color: category.color }} />
                    <div className="max-w-[120px] truncate text-gray-500 hover:text-blue-600">
                      {category?.category_name}
                    </div>
                  </div>
                );
              })}
          </div>
        );
      } else {
        const category = categories.find((category) => value === category.category_id);
        return (
          <div className={"flex items-center space-x-1 text-xs hover:text-blue-600"}>
            <AiFillTag style={{ color: category?.color }} />
            <div className="max-w-[240px] truncate">{category?.category_name}</div>
          </div>
        );
      }
    } else {
      return <AiFillTag className="text-xs" />;
    }
  }
}
