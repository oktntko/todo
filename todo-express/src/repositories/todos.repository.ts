import { Prisma } from "@prisma/client";
import ORM from "~/arch/ORM";
import { TodoBody, TodoPriorityNo, TodoResponse } from "~/controllers/api/todos.controller";
import dayjs from "~/libs/dayjs";
import { NotExistsError, UpdateConflictsError } from "~/middlewares/ErrorHandler";
import log from "~/middlewares/log";
import { TodoSubcategoriesRepository } from "~/repositories/todo_subcategories.repository";

const createTodo = async (todo: TodoBody) => {
  log.debug("createTodo");

  return ORM.todo
    .create({
      select: {
        todo_id: true,
        yarukoto: true,
        priority_no: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        updated_at: true,
        done_at: true,
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
        priority_no: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        updated_at: true,
        done_at: true,
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
        done_at: null,
      },
      orderBy: {
        priority_no: "asc",
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
        priority_no: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        updated_at: true,
        done_at: true,
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
        priority_no: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        updated_at: true,
        done_at: true,
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
        priority_no: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        updated_at: true,
        done_at: true,
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

const updateTodoDoneAt = async (where: RequireOne<Prisma.TodoWhereUniqueInput>, done_at: Date) => {
  log.debug("updateTodoDoneAt");

  return ORM.todo
    .update({
      select: {
        todo_id: true,
        yarukoto: true,
        priority_no: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        updated_at: true,
        done_at: true,
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
        done_at,
        priority_no: null,
      },
      where,
    })
    .then(transformSubcategories);
};

const updateTodoPriorityNo = async (todo: TodoPriorityNo) => {
  log.debug("updateTodoPriorityNo");

  return ORM.todo
    .update({
      select: {
        todo_id: true,
        yarukoto: true,
        priority_no: true,
        category_id: true,
        kizitu: true,
        yusendo: true,
        memo: true,
        updated_at: true,
        done_at: true,
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
        priority_no: todo.priority_no,
      },
      where: {
        todo_id: todo.todo_id,
      },
    })
    .then(transformSubcategories);
};

const checkPreviousVersion = async (
  where: Pick<Required<Prisma.TodoWhereUniqueInput>, "todo_id">,
  updated_at: string
) => {
  const previous = await findUniqueTodo(where);

  if (!previous) {
    throw new NotExistsError();
  } else if (!dayjs(previous.updated_at).isSame(updated_at)) {
    throw new UpdateConflictsError();
  }

  return previous;
};

export const TodosRepository = {
  createTodo,
  findManyTodo,
  findUniqueTodo,
  updateTodo,
  deleteTodo,
  updateTodoDoneAt,
  updateTodoPriorityNo,
  checkPreviousVersion,
} as const;

type SelectTodo = {
  todo_id: number;
  priority_no: number | null;
  done_at: Date | null;
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
