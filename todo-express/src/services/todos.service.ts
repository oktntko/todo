import { TodoBody } from "~/controllers/api/todos.controller";
import log from "~/middlewares/log";
import { TodosRepository } from "~/repositories/todos.repository";

// # POST /api/todos
const postTodo = async (todo: TodoBody) => {
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
const putTodo = async (todo_id: number, todo: TodoBody, updated_at: string) => {
  log.debug("putTodo", todo_id, todo, updated_at);

  await TodosRepository.checkPreviousVersion({ todo_id }, updated_at);

  return TodosRepository.updateTodo({ todo_id }, todo);
};

// # DELETE /api/todos/:todo_id
const deleteTodo = async (todo_id: number, updated_at: string) => {
  log.debug("deleteTodo", todo_id, updated_at);

  return TodosRepository.deleteTodo({ todo_id });
};

// # PATCH /api/todos/:todo_id/done
const patchTodo = async (todo_id: number, updated_at: string) => {
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
