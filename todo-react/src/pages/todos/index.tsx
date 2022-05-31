import { motion, Reorder } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "~/components/Loading";
import { toLabel } from "~/plugins/code";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export function TodoIndexPage() {
  const navigate = useNavigate();

  const { loading, todos, handleDone, handleReorder } = useTodos();

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
            className={`mx-auto my-4 w-full max-w-screen-sm space-y-2 px-6`}
          >
            {todos.map((todo) => (
              <TodoBox key={todo.todo_id} todo={todo} onDone={() => handleDone(todo.todo_id)} />
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

  useEffect(() => {
    getTodos().then(({ data }) => setTodos(data.todos));
  }, []);

  return { loading, todos, handleDone, handleReorder };
};

const TodoBox = memo(function TodoBox({
  todo,
  onDone,
}: {
  todo: components["schemas"]["TodoResponse"];
  onDone: (todo_id: number) => void;
}) {
  const navigate = useNavigate();

  return (
    <Reorder.Item
      value={todo}
      id={String(todo.category_id)}
      className={`cursor-move rounded border bg-white px-4 py-2 shadow-md dark:border-gray-700 dark:bg-gray-800`}
    >
      <div className="flex flex-row space-x-2">
        <div className="flex min-w-0 grow flex-col space-y-1 ">
          <div className="flex min-w-0 shrink-0 text-sm text-gray-500">
            <div className="w-60 overflow-hidden text-ellipsis whitespace-nowrap">
              <span>{todo.category?.category_name ?? ""}</span>
            </div>
            <div className="w-36">
              <span>{todo.kizitu ?? ""}</span>
            </div>
            <div className="w-12">
              <span>{toLabel.yusendo(todo.yusendo) ?? ""}</span>
            </div>
          </div>
          <div className="flex grow items-center overflow-hidden text-ellipsis whitespace-nowrap text-gray-700">
            <span className="text-xl">{todo.yarukoto ?? ""}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col space-y-1">
          <button
            type="button"
            className="rounded-lg border border-blue-700 px-5 py-2 text-center text-xs font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-600 dark:hover:text-white dark:focus:ring-blue-800"
            onClick={() => navigate(`/todos/${todo.todo_id}`)}
          >
            編集
          </button>
          <button
            type="button"
            className="rounded-lg bg-green-600 px-5 py-2 text-center text-xs font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-1 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={() => onDone(todo.todo_id)}
          >
            Done
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
});
