import { Todo } from "@prisma/client";
import log from "~/middlewares/log";
import { TodosRepository } from "~/repositories/todos.repository";

// # POST /api/todos
const postTodo = async (todo: Omit<Todo, "todo_id" | "is_done" | "created_at" | "updated_at">) => {
  log.debug("postTodo", todo);

  return TodosRepository.createTodo(todo);
};

// # GET /api/todos
const getTodos = async () => {
  log.debug("getTodos");

  return TodosRepository.findManyTodo();
};

// # GET /api/todos/:todo_id
const getTodo = async (todo_id: number) => {
  log.debug("getTodo", todo_id);

  return TodosRepository.findUniqueTodo({ todo_id });
};

// # PUT /api/todos/:todo_id
const putTodo = async (
  todo_id: number,
  todo: Omit<Todo, "todo_id" | "is_done" | "created_at" | "updated_at">,
  updated_at: Date
) => {
  log.debug("putTodo", todo_id, todo, updated_at);

  return TodosRepository.updateTodo({ todo_id }, todo);
};

// # DELETE /api/todos/:todo_id
const deleteTodo = async (todo_id: number, updated_at: Date) => {
  log.debug("deleteTodo", todo_id, updated_at);

  return TodosRepository.deleteTodo({ todo_id });
};

// # PATCH /api/todos/:todo_id/done
const patchTodo = async (todo_id: number, updated_at: Date) => {
  log.debug("patchTodo", todo_id, updated_at);

  return TodosRepository.updateTodoIsDone({ todo_id }, true);
};

export const TodosService = {
  postTodo,
  getTodos,
  getTodo,
  putTodo,
  deleteTodo,
  patchTodo,
} as const;
