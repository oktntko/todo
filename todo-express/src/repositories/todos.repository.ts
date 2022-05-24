import { Prisma } from "@prisma/client";
import ORM from "~/arch/ORM";
import { TodoBody, TodoResponse } from "~/controllers/api/todos.controller";
import log from "~/middlewares/log";
import { TodoSubcategoriesRepository } from "~/repositories/todo_subcategories.repository";

const createTodo = async (todo: TodoBody) => {
  log.debug("createTodo");

  return ORM.todo
    .create({
      select: {
        todo_id: true,
        yarukoto: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        is_done: true,
        updated_at: true,
        category: {
          select: {
            category_id: true,
            category_name: true,
          },
        },
        subcategories: {
          select: {
            category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
      },
      data: {
        yarukoto: todo.yarukoto,
        category_id: todo.category_id,
        kizitu: todo.kizitu,
        yusendo: todo.yusendo,
        memo: todo.memo,
        subcategories: {
          createMany: {
            skipDuplicates: true,
            data: todo.subcategory_id_list.map((category_id) => ({ category_id })),
          },
        },
      },
    })
    .then(transformSubcategories);
};

const findManyTodo = async (where?: Prisma.TodoWhereInput) => {
  log.debug("findManyTodo");

  return ORM.todo
    .findMany({
      select: {
        todo_id: true,
        yarukoto: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        is_done: true,
        updated_at: true,
        category: {
          select: {
            category_id: true,
            category_name: true,
          },
        },
        subcategories: {
          select: {
            category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
      },
      where: {
        ...where,
        is_done: false,
      },
    })
    .then((todos) => todos.map(transformSubcategories));
};

const findUniqueTodo = async (where: RequireOne<Prisma.TodoWhereUniqueInput>) => {
  log.debug("findUniqueTodo");

  return ORM.todo
    .findUnique({
      select: {
        todo_id: true,
        yarukoto: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        is_done: true,
        updated_at: true,
        category: {
          select: {
            category_id: true,
            category_name: true,
          },
        },
        subcategories: {
          select: {
            category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
      },
      where,
    })
    .then((todo) => (todo ? transformSubcategories(todo) : null));
};

const updateTodo = async (where: RequireOne<Prisma.TodoWhereUniqueInput>, todo: TodoBody) => {
  log.debug("updateTodo");

  await TodoSubcategoriesRepository.deleteManyTodoSubcategory(where);

  return ORM.todo
    .update({
      select: {
        todo_id: true,
        yarukoto: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        is_done: true,
        updated_at: true,
        category: {
          select: {
            category_id: true,
            category_name: true,
          },
        },
        subcategories: {
          select: {
            category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
      },
      data: {
        yarukoto: todo.yarukoto,
        category_id: todo.category_id,
        kizitu: todo.kizitu,
        yusendo: todo.yusendo,
        memo: todo.memo,
        subcategories: {
          createMany: {
            skipDuplicates: true,
            data: todo.subcategory_id_list.map((category_id) => ({ category_id })),
          },
        },
      },
      where,
    })
    .then(transformSubcategories);
};

const deleteTodo = async (where: RequireOne<Prisma.TodoWhereUniqueInput>) => {
  log.debug("deleteTodo");

  return ORM.todo
    .delete({
      select: {
        todo_id: true,
        yarukoto: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        is_done: true,
        updated_at: true,
        category: {
          select: {
            category_id: true,
            category_name: true,
          },
        },
        subcategories: {
          select: {
            category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
      },
      where,
    })
    .then(transformSubcategories);
};

const updateTodoIsDone = async (
  where: RequireOne<Prisma.TodoWhereUniqueInput>,
  is_done: boolean
) => {
  log.debug("updateTodoIsDone");

  return ORM.todo
    .update({
      select: {
        todo_id: true,
        yarukoto: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        is_done: true,
        updated_at: true,
        category: {
          select: {
            category_id: true,
            category_name: true,
          },
        },
        subcategories: {
          select: {
            category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
      },
      data: { is_done },
      where,
    })
    .then(transformSubcategories);
};

export const TodosRepository = {
  createTodo,
  findManyTodo,
  findUniqueTodo,
  updateTodo,
  deleteTodo,
  updateTodoIsDone,
} as const;

type SelectTodo = {
  todo_id: number;
  is_done: boolean;
  updated_at: Date;
  yarukoto: string;
  category_id: number | null;
  kizitu: string | null;
  yusendo: string | null;
  memo: string | null;
  category: {
    category_id: number;
    category_name: string;
  } | null;
  subcategories: {
    category: {
      category_id: number;
      category_name: string;
    };
  }[];
};

const transformSubcategories = (todo: SelectTodo): TodoResponse => {
  return {
    ...todo,
    subcategories: todo.subcategories.map((subcategory) => subcategory.category),
  };
};
