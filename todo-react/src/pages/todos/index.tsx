import type { XYCoord } from "dnd-core";
import update from "immutability-helper";
import React, { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useNavigate } from "react-router-dom";
import { Loading } from "~/components/Loading";
import { toLabel } from "~/plugins/code";
import { api } from "~/repositories/api";
import { components, paths } from "~/repositories/schema";

export const TodoIndexPage = React.memo(function TodoIndexPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [todos, setTodos] = useState<
    paths["/api/todos"]["get"]["responses"]["200"]["content"]["application/json"]["todos"]
  >([]);

  useEffect(() => {
    getTodos();
  }, []);

  const getTodos = () => {
    setLoading(true);

    api.get
      .todos()
      .then(({ data }) => {
        setTodos(data.todos);
      })
      .finally(() => setLoading(false));
  };

  const handleDone = (todo_id: number) => {
    setTodos(todos.filter((todo) => todo.todo_id !== todo_id));

    api.patch.todos.done({ todo_id: String(todo_id) });
  };

  const moveTodo = (currentIndex: number, hoverIndex: number) => {
    setTodos((todos: components["schemas"]["TodoResponse"][]) =>
      update(todos, {
        $splice: [
          [currentIndex, 1],
          [hoverIndex, 0, todos[currentIndex]],
        ],
      })
    );
  };

  const renderTodoBox = (todo: components["schemas"]["TodoResponse"], index: number) => {
    return (
      <TodoBox
        key={todo.todo_id}
        todo={todo}
        index={index}
        moveTodo={moveTodo}
        onDone={() => handleDone(todo.todo_id)}
      />
    );
  };

  useEffect(() => {
    api.patch.todos.priority({
      todos: todos.map(({ todo_id }, index) => {
        return { todo_id, priority_no: index };
      }),
    });
  }, [todos]);

  return (
    <>
      <Loading loading={loading} />
      <DndProvider backend={HTML5Backend}>
        {/* 条件分岐(v-if みたいな)だと再レンダリングのせいかドラッグ中のステータスがOFFになるため visibleで制御している */}
        {/* ローディング中 スケルトン */}
        <div
          className={`${
            loading ? "visible" : "hidden"
          } mx-auto my-4 w-full max-w-screen-sm space-y-2 px-6`}
        >
          {[...Array(5)].map((_, i) => (
            <TodoBoxSkelton key={i} />
          ))}
        </div>
        {/* データがあるあとき */}
        <div
          className={`${
            todos.length ? "visible" : "hidden"
          } mx-auto my-4 w-full max-w-screen-sm space-y-2 px-6`}
        >
          {todos.map(renderTodoBox)}
        </div>
        {/* データがないとき */}
        <div
          className={`${
            todos.length === 0 ? "visible" : "hidden"
          } mx-auto h-full w-full max-w-screen-sm space-y-2 px-6`}
        >
          <div className="flex h-full items-center justify-center">私は今、自由です🎉</div>
        </div>
      </DndProvider>
      <button
        className="fixed bottom-16 right-24 h-20 w-20 rounded-full bg-blue-600 p-0 text-white shadow-md lg:right-[24%] 2xl:right-[32%]"
        onClick={() => navigate("/todos/add")}
      >
        追加
      </button>
    </>
  );
});

const TodoBox = React.memo(function TodoBox({
  todo,
  index,
  onDone,
  moveTodo,
}: {
  todo: components["schemas"]["TodoResponse"];
  index: number;
  onDone: (todo_id: number) => void;
  moveTodo: (currentIndex: number, hoverIndex: number) => void;
}) {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "TodoBox",
    item: (): { index: number } => ({ index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop<{ index: number } /* useDrag の item() */>({
    accept: "TodoBox",
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const currentIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (currentIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (currentIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (currentIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveTodo(currentIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`${
        isDragging ? "opacity-10" : "opacity-100"
      } cursor-move rounded border bg-white px-4 py-2 shadow-md dark:border-gray-700 dark:bg-gray-800`}
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
    </div>
  );
});

const TodoBoxSkelton = () => {
  return (
    <div className="rounded border bg-white px-4 py-2 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-row space-x-2">
        <div className="flex min-w-0 grow animate-pulse flex-col space-y-1 ">
          <div className="flex min-w-0 shrink-0 text-sm text-gray-500">
            <div className="w-60 overflow-hidden text-ellipsis whitespace-nowrap">
              <p className="h-5 rounded bg-slate-200"></p>
            </div>
            <div className="w-36">
              <p className="h-5 rounded bg-slate-200"></p>
            </div>
            <div className="w-12">
              <p className="h-5 rounded bg-slate-200"></p>
            </div>
          </div>
          <div className="flex grow items-center overflow-hidden text-ellipsis whitespace-nowrap text-gray-700">
            <p className="h-8 w-full rounded bg-slate-200"></p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col space-y-1">
          <button
            type="button"
            disabled
            className="rounded-lg border border-slate-700 px-5 py-2 text-center text-xs font-medium text-slate-700 dark:text-slate-500"
          >
            編集
          </button>
          <button
            type="button"
            disabled
            className="rounded-lg bg-slate-600 px-5 py-2 text-center text-xs font-medium text-white dark:bg-slate-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
