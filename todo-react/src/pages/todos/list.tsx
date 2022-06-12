import equal from "fast-deep-equal";
import { Field, FieldInputProps, Form, Formik } from "formik";
import { motion, Reorder, useDragControls } from "framer-motion";
import update from "immutability-helper";
import { useCallback, useEffect, useState } from "react";
import { AiFillTag } from "react-icons/ai";
import { BiCheckCircle, BiSend, BiTrash, BiUndo } from "react-icons/bi";
import { BsPlus } from "react-icons/bs";
import { MdCategory, MdOutlineDragIndicator } from "react-icons/md";
import { Button } from "~/components/Button";
import { ProjectIcon } from "~/components/Image";
import { SelectInput } from "~/components/Input";
import { Tooltip } from "~/components/Tooltip";
import { generateId } from "~/libs/strings";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

interface TodoType extends Weaken<components["schemas"]["TodoResponse"], "todo_id"> {
  todo_id: string | number;
}

const newdata = (index: number) => ({
  todo_id: generateId(), // 追加分は id が string
  yarukoto: "",
  order: index,
  beginning: "",
  deadline: "",
  memo: "",
  status_id: undefined,
  category_id: undefined,
  project_id: undefined,
  tag_id_list: [],
  updated_at: "",
});

export function TodoListPage() {
  const { todos, setTodos, postTodos, putTodos, deleteTodos, patchTodoReorder, doneTodos } =
    useTodo();
  const selections = useSelections();

  const handleReorder = (values: TodoType[]) => {
    const todos = values.map((todo, index) => ({ ...todo, order: index }));
    setTodos(values);

    if (todos.length) {
      patchTodoReorder({
        todos: todos.filter(
          (todo) => typeof todo.todo_id === "number"
        ) as components["schemas"]["TodoReorderBody"][],
      });
    }
  };

  const handleSubmit = (index: number, values: TodoType) => {
    if (typeof values.todo_id === "string") {
      postTodos(index, { ...values, order: index });
    } else {
      putTodos(index, values.todo_id, { ...values, order: index });
    }
  };

  const handleDelete = (index: number, values: TodoType) => {
    if (typeof values.todo_id === "number") {
      deleteTodos(index, values.todo_id, values);
    }
  };

  const handleDone = (index: number, values: TodoType) => {
    if (typeof values.todo_id === "number") {
      doneTodos(index, values.todo_id, values);
    }
  };

  const handleAdd = () => {
    setTodos(update(todos, { $push: [newdata(todos.length)] }));
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="container mx-auto sm:px-4 md:my-4 md:max-w-3xl">
          <Reorder.Group values={todos} onReorder={handleReorder} className=" ">
            {todos.map((todo, index) => (
              <TodoRow
                key={todo.todo_id}
                index={index}
                todo={todo}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                onDone={handleDone}
                {...selections}
              />
            ))}
          </Reorder.Group>

          <div className="flex flex-row flex-nowrap items-center justify-start space-x-2 ">
            <Button
              type="button"
              className="flex flex-grow items-center space-x-2 rounded-none border-0 bg-neutral-100 p-2 hover:bg-slate-200"
              onClick={handleAdd}
            >
              <BsPlus />
              <span>追加</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

const useTodo = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);

  const getTodos = useCallback(() => {
    api.get.todos().then(({ data }) => setTodos(data.todos));
  }, [todos]);

  useEffect(() => {
    getTodos();
  }, []);

  const postTodos = useCallback(
    (index: number, todo: components["schemas"]["TodoBody"]) => {
      api.post
        .todos(todo)
        .then(({ data }) => setTodos(update(todos, { $splice: [[index, 1, data]] })));
    },
    [todos]
  );

  const putTodos = useCallback(
    (index: number, todo_id: number, todo: components["schemas"]["TodoBody"] & Version) => {
      api.put
        .todos({ todo_id: String(todo_id) }, todo)
        .then(({ data }) => setTodos(update(todos, { $splice: [[index, 1, data]] })));
    },
    [todos]
  );

  const deleteTodos = useCallback(
    (index: number, todo_id: number, version: Version) => {
      api.delete
        .todos({ todo_id: String(todo_id) }, version)
        .then(() => setTodos(update(todos, { $splice: [[index, 1]] })));
    },
    [todos]
  );

  const patchTodoReorder = useCallback(
    ({ todos }: components["schemas"]["ListTodoBody"]) => {
      api.patch.todosReorder({ todos });
    },
    [todos]
  );

  const doneTodos = useCallback(
    (index: number, todo_id: number, version: Version) => {
      api.patch
        .todosDone({ todo_id: String(todo_id) }, version)
        .then(() => setTodos(update(todos, { $splice: [[index, 1]] })));
    },
    [todos]
  );

  return {
    todos,
    setTodos,
    getTodos,
    postTodos,
    putTodos,
    deleteTodos,
    patchTodoReorder,
    doneTodos,
  };
};

const useSelections = () => {
  const [statuses, setStatuses] = useState<components["schemas"]["StatusResponse"][]>([]);
  const [categories, setCategories] = useState<components["schemas"]["CategoryResponse"][]>([]);
  const [projects, setProjects] = useState<components["schemas"]["ProjectResponse"][]>([]);
  const [tags, setTags] = useState<components["schemas"]["TagResponse"][]>([]);

  const getCategories = useCallback(() => {
    api.get.categories().then(({ data }) => setCategories(data.categories));
  }, [categories]);
  const getStatuses = useCallback(() => {
    api.get.statuses().then(({ data }) => setStatuses(data.statuses));
  }, [statuses]);
  const getProjects = useCallback(() => {
    api.get.projects().then(({ data }) => setProjects(data.projects));
  }, [projects]);
  const getTags = useCallback(() => {
    api.get.tags().then(({ data }) => setTags(data.tags));
  }, [tags]);

  useEffect(() => {
    getProjects();
    getStatuses();
    getCategories();
    getTags();
  }, []);

  return {
    statuses,
    categories,
    projects,
    tags,
  };
};

type TodoRowProps = {
  index: number;
  todo: TodoType;
  onSubmit: (index: number, values: TodoType) => void;
  onDelete: (index: number, values: TodoType) => void;
  onDone: (index: number, values: TodoType) => void;
  statuses: components["schemas"]["StatusResponse"][];
  categories: components["schemas"]["CategoryResponse"][];
  projects: components["schemas"]["ProjectResponse"][];
  tags: components["schemas"]["TagResponse"][];
};

function TodoRow(props: TodoRowProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={props.todo.todo_id}
      value={props.todo}
      dragListener={false}
      dragControls={dragControls}
      className="border-b"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Formik
          initialValues={props.todo}
          enableReinitialize
          onSubmit={(values) => props.onSubmit(props.index, values)}
        >
          {({ values, resetForm }) => {
            const isOriginalValues = equal(values, props.todo);

            return (
              <Form>
                <div
                  className={`flex flex-row flex-nowrap items-center justify-start
                  space-x-2 bg-neutral-100 p-4`}
                >
                  {/* 左側 */}
                  <Button
                    type="button"
                    className="cursor-move border-0"
                    onPointerDown={(event) => dragControls.start(event)}
                  >
                    <MdOutlineDragIndicator className="text-xl" />
                  </Button>

                  {/* 真ん中 */}
                  <div className="flex grow flex-col flex-nowrap space-y-2">
                    {/* １行目 */}
                    <div className="flex flex-wrap items-center space-x-4 text-sm">
                      {/* ステータス */}
                      <Field name="status_id" className="flex items-center py-1">
                        {({ field }: { field: FieldInputProps<number | null> }) => (
                          <SelectInput
                            {...field}
                            multiple={false}
                            options={props.statuses}
                            optionId={statusId}
                            optionStyle={statusStyle}
                            placeholder={"ステータス"}
                          />
                        )}
                      </Field>
                      {/* カテゴリ */}
                      <Field name="category_id" className="flex items-center py-1">
                        {({ field }: { field: FieldInputProps<number | null> }) => (
                          <SelectInput
                            {...field}
                            multiple={false}
                            options={props.categories}
                            optionId={categoryId}
                            optionStyle={categoryStyle}
                            placeholder={"カテゴリ"}
                          />
                        )}
                      </Field>
                      {/* プロジェクト */}
                      <Field name="project_id" className="flex items-center py-1">
                        {({ field }: { field: FieldInputProps<number | null> }) => (
                          <SelectInput
                            {...field}
                            multiple={false}
                            options={props.projects}
                            optionId={projectId}
                            optionStyle={projectStyle}
                            placeholder={"プロジェクト"}
                          />
                        )}
                      </Field>
                      {/* 開始日と期日 */}
                      <div className="flex flex-nowrap items-center space-x-1 py-1">
                        {/* 開始日 */}
                        <Field
                          name="beginning"
                          type="date"
                          className="border-[0.5px] focus:outline-none"
                        />
                        <span> ～ </span>
                        {/* 期日 */}
                        <Field
                          name="deadline"
                          type="date"
                          className="border-[0.5px] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* ２行目 */}
                    <div className="flex items-center space-x-2 ">
                      {/* やること */}
                      <Field
                        type="text"
                        name="yarukoto"
                        className="flex-grow truncate rounded border p-1"
                        maxLength={100}
                      />
                    </div>
                    {/* ３行目 */}
                    <div className="text-xs">
                      <Field name="tag_id_list" className="flex items-center">
                        {({ field }: { field: FieldInputProps<number[]> }) => (
                          <SelectInput
                            {...field}
                            multiple={true}
                            options={props.tags}
                            optionId={tagId}
                            optionStyle={tagStyle}
                            placeholder={"タグ"}
                          />
                        )}
                      </Field>
                    </div>
                  </div>

                  {/* 右側 */}
                  <div className="flex flex-col flex-nowrap items-center space-y-2">
                    <div className="flex flex-row flex-nowrap justify-end space-x-2 ">
                      <Tooltip message="Undo" className="uppercase">
                        <Button
                          type="button"
                          className="rounded-3xl p-1"
                          colorset={"white"}
                          disabled={isOriginalValues}
                          onClick={() => {
                            resetForm({ values: props.todo });
                          }}
                        >
                          <BiUndo className="text-lg" />
                        </Button>
                      </Tooltip>
                      <Tooltip message="Commit">
                        <Button
                          type="submit"
                          className="rounded-3xl p-1"
                          colorset={"green"}
                          disabled={isOriginalValues || values.yarukoto === ""}
                        >
                          <BiSend className="text-lg" />
                        </Button>
                      </Tooltip>
                    </div>
                    <div className="flex flex-row flex-nowrap justify-end space-x-2 ">
                      <Tooltip message="Delete">
                        <Button
                          type="button"
                          className="rounded-3xl p-1"
                          colorset={"yellow"}
                          disabled={typeof values.todo_id === "string"}
                          onClick={() => {
                            props.onDelete(props.index, values);
                          }}
                        >
                          <BiTrash className="text-lg" />
                        </Button>
                      </Tooltip>
                      <Tooltip message="Done">
                        <Button
                          type="button"
                          className="rounded-3xl p-1"
                          colorset={"blue"}
                          disabled={typeof values.todo_id === "string"}
                          onClick={() => {
                            props.onDone(props.index, values);
                          }}
                        >
                          <BiCheckCircle className="text-lg" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </motion.div>
    </Reorder.Item>
  );
}

// ! うまくできないのか
const statusId = (option: components["schemas"]["StatusResponse"]) => {
  return option.status_id;
};
const statusStyle = (option?: components["schemas"]["StatusResponse"] | undefined) => {
  return (
    <div
      className={`inline-flex items-center rounded-full px-2 py-[2px] ${option ? "" : "hidden"}`}
      style={{ backgroundColor: option?.color }}
    >
      <span
        style={{ color: option?.color, filter: "invert(100%) grayscale(100%) contrast(100)" }}
        className="truncate"
      >
        {option?.status_name}
      </span>
    </div>
  );
};

const categoryId = (option: components["schemas"]["CategoryResponse"]) => {
  return option.category_id;
};
const categoryStyle = (option?: components["schemas"]["CategoryResponse"] | undefined) => {
  return (
    <>
      <MdCategory style={{ color: option?.color }} className="shrink-0" />
      <div className="block truncate">{option?.category_name}</div>
    </>
  );
};

const projectId = (option: components["schemas"]["ProjectResponse"]) => {
  return option.project_id;
};
const projectStyle = (option?: components["schemas"]["ProjectResponse"] | undefined) => {
  return (
    <>
      <ProjectIcon className="h-4 w-4 shrink-0" project_id={option?.project_id} />
      <div className="block truncate">{option?.project_name}</div>
    </>
  );
};

const tagId = (option: components["schemas"]["TagResponse"]) => {
  return option.tag_id;
};
const tagStyle = (option?: components["schemas"]["TagResponse"] | undefined) => {
  return (
    <>
      <AiFillTag style={{ color: option?.color }} className="shrink-0" />
      <div className="block truncate">{option?.tag_name}</div>
    </>
  );
};
