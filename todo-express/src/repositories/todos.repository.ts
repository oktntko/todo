import { Prisma, Todo } from "@prisma/client";
import ORM from "~/arch/ORM";
import log from "~/middlewares/log";

const createTodo = async (
  todo: Omit<Todo, "todo_id" | "is_done" | "created_at" | "updated_at">
) => {
  log.debug("createTodo");

  return ORM.todo.create({
    select: {
      todo_id: true,
      yarukoto: true,
      category_id: true,
      kizitu: true,
      yusendo: true,
      memo: true,
      is_done: true,
      created_at: true,
      updated_at: true,
      category: true,
      subcategories: true,
    },
    data: todo,
  });
};

const findManyTodo = async (where?: Prisma.TodoWhereInput) => {
  log.debug("findManyTodo");

  return ORM.todo.findMany({
    select: {
      todo_id: true,
      yarukoto: true,
      category_id: true,
      kizitu: true,
      yusendo: true,
      memo: true,
      is_done: true,
      created_at: true,
      updated_at: true,
      category: true,
      subcategories: true,
    },
    where,
  });
};

const findUniqueTodo = async (where: RequireOne<Prisma.TodoWhereUniqueInput>) => {
  log.debug("findUniqueTodo");

  return ORM.todo.findUnique({
    select: {
      todo_id: true,
      yarukoto: true,
      category_id: true,
      kizitu: true,
      yusendo: true,
      memo: true,
      is_done: true,
      created_at: true,
      updated_at: true,
      category: true,
      subcategories: true,
    },
    where,
  });
};

const updateTodo = async (
  where: RequireOne<Prisma.TodoWhereUniqueInput>,
  todo: Omit<Todo, "todo_id" | "is_done" | "created_at" | "updated_at">
) => {
  log.debug("updateTodo");

  return ORM.todo.update({
    select: {
      todo_id: true,
      yarukoto: true,
      category_id: true,
      kizitu: true,
      yusendo: true,
      memo: true,
      is_done: true,
      created_at: true,
      updated_at: true,
      category: true,
      subcategories: true,
    },
    data: todo,
    where,
  });
};

const deleteTodo = async (where: RequireOne<Prisma.TodoWhereUniqueInput>) => {
  log.debug("deleteTodo");

  return ORM.todo.delete({
    select: {
      todo_id: true,
      yarukoto: true,
      category_id: true,
      kizitu: true,
      yusendo: true,
      memo: true,
      is_done: true,
      created_at: true,
      updated_at: true,
      category: true,
      subcategories: true,
    },
    where,
  });
};

const updateTodoIsDone = async (
  where: RequireOne<Prisma.TodoWhereUniqueInput>,
  is_done: boolean
) => {
  log.debug("updateTodoIsDone");

  return ORM.todo.update({
    select: {
      todo_id: true,
      yarukoto: true,
      category_id: true,
      kizitu: true,
      yusendo: true,
      memo: true,
      is_done: true,
      created_at: true,
      updated_at: true,
      category: true,
      subcategories: true,
    },
    data: { is_done },
    where,
  });
};

export const TodosRepository = {
  createTodo,
  findManyTodo,
  findUniqueTodo,
  updateTodo,
  deleteTodo,
  updateTodoIsDone,
} as const;
