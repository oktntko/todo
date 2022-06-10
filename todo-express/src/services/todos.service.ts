import { Todo } from "@prisma/client";
import log from "~/middlewares/log";
import { TodosRepository } from "~/repositories/todos.repository";

// # POST /api/todos
const postTodo = async (
  todo: Omit<Todo, "todo_id" | "created_at" | "updated_at" | "done_at"> & { tag_id_list: number[] }
) => {
  log.debug("postTodo", todo);

  return TodosRepository.createTodo(todo);
};

// # GET /api/todos
const getTodos = async () => {
  log.debug("getTodos");

  const todos = await TodosRepository.findManyTodo();

  return { todos };
};

// # GET /api/todos/:todo_id
const getTodo = async (todo_id: number) => {
  log.debug("getTodo", todo_id);

  return TodosRepository.findUniqueTodo({ todo_id });
};

// # PUT /api/todos/:todo_id
const putTodo = async (
  todo_id: number,
  todo: Omit<Todo, "todo_id" | "created_at" | "updated_at" | "done_at"> & { tag_id_list: number[] },
  updated_at: string
) => {
  log.debug("putTodo", todo_id, todo, updated_at);

  await TodosRepository.checkPreviousVersion({ todo_id }, updated_at);

  return TodosRepository.updateTodo({ todo_id }, todo);
};

// # DELETE /api/todos/:todo_id
const deleteTodo = async (todo_id: number, updated_at: string) => {
  log.debug("deleteTodo", todo_id, updated_at);

  return TodosRepository.deleteTodo({ todo_id });
};

export const TodosService = {
  postTodo,
  getTodos,
  getTodo,
  putTodo,
  deleteTodo,
} as const;
