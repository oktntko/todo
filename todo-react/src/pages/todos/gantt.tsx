import { AnimatePresence, motion } from "framer-motion";
import { DisplayOption, EventOption, Gantt, StylingOption, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useCallback, useEffect, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { Button } from "~/components/Button";
import { api } from "~/repositories/api";

export function TodoGanttPage() {
  const { todos } = useTodo();
  const [showTasks, setShowTasks] = useState(true);
  const [viewMode, setViewMode] = useState(ViewMode.Day);

  const event: EventOption = {
    onDateChange(task, children) {
      console.log(task, children);
    },
    onDelete(task) {
      console.log(task);
    },
    onDoubleClick(task) {
      console.log(task);
    },
    onExpanderClick(task) {
      console.log(task);
    },
    onProgressChange(task, children) {
      console.log(task, children);
    },
    onSelect(task, isSelected) {
      console.log(task, isSelected);
    },
  };

  const display: DisplayOption = {
    viewMode,
    viewDate: new Date(),
    locale: "jav",
    rtl: false,
  };

  const style: StylingOption = {
    fontFamily: "",
    listCellWidth: showTasks ? "155px" : "",
  };

  return (
    <>
      <div className="sm:px-4 md:my-4">
        <ul className="flex justify-end space-x-4 px-4 pb-4">
          <li>
            <ModeSelect viewMode={viewMode} setViewMode={setViewMode} />
          </li>
          <div
            className={`
              flex h-8 w-12 cursor-pointer items-center rounded-full
              ${showTasks ? "justify-end bg-green-300" : "justify-start bg-gray-500"}
            `}
            onClick={() => setShowTasks(!showTasks)}
          >
            <motion.div
              className="h-6 w-6 rounded-full bg-white shadow"
              layout
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 30,
              }}
            />
          </div>
        </ul>
        {todos.length === 0 ? (
          <div></div>
        ) : (
          <Gantt tasks={todos} {...event} {...display} {...style} />
        )}
      </div>
    </>
  );
}

const useTodo = () => {
  const [todos, setTodos] = useState<Task[]>([]);

  const getTodos = useCallback(() => {
    api.get.todos().then(({ data }) =>
      setTodos(
        data.todos.map((todo) => {
          return {
            id: String(todo.todo_id),
            name: todo.yarukoto ?? "",
            type: "task",
            start: todo.beginning ? new Date(todo.beginning) : new Date(),
            end: todo.deadline ? new Date(todo.deadline) : new Date(),
            progress: 0,
            displayOrder: todo.order,
          };
        })
      )
    );
  }, [todos]);

  useEffect(() => {
    getTodos();
  }, []);

  return {
    todos,
    setTodos,
    getTodos,
  };
};

type ModeSelectProps = {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
};
function ModeSelect({ viewMode, setViewMode }: ModeSelectProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button className="flex items-center border-none" onClick={() => setIsVisible(!isVisible)}>
        <span> Mode </span>
      </Button>
      <AnimatePresence>
        {isVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { ease: "easeInOut", duration: 0.2 } }}
              className="absolute inset-0 z-10"
              onClick={() => setIsVisible(false)}
            ></motion.div>
            <div className="relative">
              <motion.div
                className={`absolute right-0 z-10 w-32 divide-y divide-gray-100 rounded bg-white shadow dark:bg-gray-700 `}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ opacity: { ease: "easeInOut", duration: 0.2 } }}
              >
                <ul
                  className="p-2 text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefault"
                >
                  {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map((mode) => (
                    <li key={mode} className="relative">
                      <Button
                        className="w-full border-none pl-6 hover:text-amber-800"
                        onClick={() => setViewMode(mode)}
                      >
                        <span className="capitalize">{mode}</span>
                      </Button>
                      {viewMode === mode ? (
                        <span className="absolute inset-y-0 left-0 flex items-center text-amber-600">
                          <AiOutlineCheck aria-hidden="true" />
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
