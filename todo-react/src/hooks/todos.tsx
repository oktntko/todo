import update from "immutability-helper";
import { useCallback, useEffect, useState } from "react";
import { AiFillTag } from "react-icons/ai";
import { MdCategory } from "react-icons/md";
import { ProjectIcon } from "~/components/Image";
import { generateId } from "~/libs/strings";
import { api } from "~/repositories/api";
import { components } from "~/repositories/schema";

export interface TodoType extends Weaken<components["schemas"]["TodoResponse"], "todo_id"> {
  todo_id: string | number;
}

export const newdata = (index: number, todo?: Partial<components["schemas"]["TodoResponse"]>) => ({
  todo_id: generateId(), // 追加分は id が string
  yarukoto: todo?.yarukoto ?? "",
  order: index,
  beginning: todo?.beginning ?? "",
  deadline: todo?.deadline ?? "",
  memo: todo?.memo ?? "",
  status_id: todo?.status_id ?? undefined,
  category_id: todo?.category_id ?? undefined,
  project_id: todo?.project_id ?? undefined,
  tag_id_list: [],
  updated_at: todo?.updated_at ?? "",
});

export const useTodo = () => {
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

  const moveStatusTodos = useCallback(
    (todo_id: number, status_id: number) => {
      api.patch.todosStatus({ todo_id: String(todo_id) }, { status_id });
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
    moveStatusTodos,
  };
};

export const useSelections = () => {
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

// ! うまくできないのか
export const statusId = (option: components["schemas"]["StatusResponse"]) => option.status_id;
export const statusStyle = (option?: components["schemas"]["StatusResponse"] | undefined) => {
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

export const categoryId = (option: components["schemas"]["CategoryResponse"]) => option.category_id;
export const categoryStyle = (option?: components["schemas"]["CategoryResponse"] | undefined) => {
  return (
    <>
      <MdCategory style={{ color: option?.color }} className="shrink-0" />
      <div className="block truncate">{option?.category_name}</div>
    </>
  );
};

export const projectId = (option: components["schemas"]["ProjectResponse"]) => option.project_id;
export const projectStyle = (option?: components["schemas"]["ProjectResponse"] | undefined) => {
  return (
    <>
      <ProjectIcon className="h-4 w-4 shrink-0" project_id={option?.project_id} />
      <div className="block truncate">{option?.project_name}</div>
    </>
  );
};

export const tagId = (option: components["schemas"]["TagResponse"]) => option.tag_id;
export const tagStyle = (option?: components["schemas"]["TagResponse"] | undefined) => {
  return (
    <>
      <AiFillTag style={{ color: option?.color }} className="shrink-0" />
      <div className="block truncate">{option?.tag_name}</div>
    </>
  );
};
