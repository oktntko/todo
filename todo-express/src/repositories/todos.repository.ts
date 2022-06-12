import { Prisma, Todo } from "@prisma/client";
import ORM from "~/arch/ORM";
import { TodoResponse } from "~/controllers/api/todos.controller";
import dayjs from "~/libs/dayjs";
import { NotExistsError, UpdateConflictsError } from "~/middlewares/ErrorHandler";
import log from "~/middlewares/log";
import { TodoTagsRepository } from "~/repositories/todo_tags.repository";

const createTodo = async (
  todo: Omit<Todo, "todo_id" | "created_at" | "updated_at" | "done_at"> & { tag_id_list: number[] }
) => {
  log.debug("createTodo");

  return ORM.todo
    .create({
      select: {
        todo_id: true,
        yarukoto: true,
        order: true,
        beginning: true,
        deadline: true,
        memo: true,
        status_id: true,
        category_id: true,
        project_id: true,
        tags: {
          select: {
            tag_id: true,
          },
        },
        updated_at: true,
        done_at: true,
      },
      data: {
        yarukoto: todo.yarukoto,
        order: todo.order,
        beginning: todo.beginning,
        deadline: todo.deadline,
        memo: todo.memo,
        status_id: todo.status_id,
        category_id: todo.category_id,
        project_id: todo.project_id,
        tags: {
          createMany: {
            skipDuplicates: true,
            data: todo.tag_id_list.map((tag_id) => ({ tag_id })),
          },
        },
      },
    })
    .then(transform);
};

const findManyTodo = async (
  where?: Prisma.TodoWhereInput,
  orderBy?: Prisma.Enumerable<Prisma.TodoOrderByWithRelationInput>
) => {
  log.debug("findManyTodo");

  return ORM.todo
    .findMany({
      select: {
        todo_id: true,
        yarukoto: true,
        order: true,
        beginning: true,
        deadline: true,
        memo: true,
        status_id: true,
        category_id: true,
        project_id: true,
        tags: {
          select: {
            tag_id: true,
          },
        },
        updated_at: true,
        done_at: true,
      },
      where: {
        ...where,
        done_at: null,
      },
      orderBy: {
        ...orderBy,
        todo_id: "asc",
      },
    })
    .then((todo) => todo.map(transform));
};

const findUniqueTodo = async (where: RequireOne<Prisma.TodoWhereUniqueInput>) => {
  log.debug("findUniqueTodo");

  return ORM.todo
    .findUnique({
      select: {
        todo_id: true,
        yarukoto: true,
        order: true,
        beginning: true,
        deadline: true,
        memo: true,
        status_id: true,
        category_id: true,
        project_id: true,
        tags: {
          select: {
            tag_id: true,
          },
        },
        updated_at: true,
        done_at: true,
      },
      where,
    })
    .then((todo) => (todo ? transform(todo) : null));
};

const updateTodo = async (
  where: RequireOne<Prisma.TodoWhereUniqueInput>,
  todo: Omit<Todo, "todo_id" | "created_at" | "updated_at" | "done_at"> & { tag_id_list: number[] }
) => {
  log.debug("updateTodo");

  await TodoTagsRepository.deleteManyTodoTag(where);

  return ORM.todo
    .update({
      select: {
        todo_id: true,
        yarukoto: true,
        order: true,
        beginning: true,
        deadline: true,
        memo: true,
        status_id: true,
        category_id: true,
        project_id: true,
        tags: {
          select: {
            tag_id: true,
          },
        },
        updated_at: true,
        done_at: true,
      },
      data: {
        yarukoto: todo.yarukoto,
        order: todo.order,
        beginning: todo.beginning,
        deadline: todo.deadline,
        memo: todo.memo,
        status_id: todo.status_id,
        category_id: todo.category_id,
        project_id: todo.project_id,
        tags: {
          createMany: {
            skipDuplicates: true,
            data: todo.tag_id_list.map((tag_id) => ({ tag_id })),
          },
        },
      },
      where,
    })
    .then(transform);
};

const deleteTodo = async (where: RequireOne<Prisma.TodoWhereUniqueInput>) => {
  log.debug("deleteTodo");

  return ORM.todo
    .delete({
      select: {
        todo_id: true,
        yarukoto: true,
        order: true,
        beginning: true,
        deadline: true,
        memo: true,
        status_id: true,
        category_id: true,
        project_id: true,
        tags: {
          select: {
            tag_id: true,
          },
        },
        updated_at: true,
        done_at: true,
      },
      where,
    })
    .then(transform);
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

const updateTodoOrder = async (todo: Pick<Todo, "todo_id" | "order">) => {
  log.debug("updateTodoOrder");

  return ORM.todo
    .update({
      select: {
        todo_id: true,
        yarukoto: true,
        order: true,
        beginning: true,
        deadline: true,
        memo: true,
        status_id: true,
        category_id: true,
        project_id: true,
        tags: {
          select: {
            tag_id: true,
          },
        },
        updated_at: true,
        done_at: true,
      },
      data: {
        order: todo.order,
      },
      where: {
        todo_id: todo.todo_id,
      },
    })
    .then(transform);
};

const updateTodoDone = async (todo: Pick<Todo, "todo_id">) => {
  log.debug("updateTodoDone");

  return ORM.todo
    .update({
      select: {
        todo_id: true,
        yarukoto: true,
        order: true,
        beginning: true,
        deadline: true,
        memo: true,
        status_id: true,
        category_id: true,
        project_id: true,
        tags: {
          select: {
            tag_id: true,
          },
        },
        updated_at: true,
        done_at: true,
      },
      data: {
        done_at: new Date(),
      },
      where: {
        todo_id: todo.todo_id,
      },
    })
    .then(transform);
};

export const TodosRepository = {
  createTodo,
  findManyTodo,
  findUniqueTodo,
  updateTodo,
  deleteTodo,
  checkPreviousVersion,
  updateTodoOrder,
  updateTodoDone,
} as const;

type SelectTodo = {
  todo_id: number;
  yarukoto: string | null;
  order: number | null;
  beginning: string | null;
  deadline: string | null;
  memo: string | null;
  status_id: number | null;
  category_id: number | null;
  project_id: number | null;
  updated_at: Date;
  done_at: Date | null;
  tags: {
    tag_id: number;
  }[];
};

const transform = (todo: SelectTodo): TodoResponse => {
  return {
    ...todo,
    tag_id_list: todo.tags.map((tag) => tag.tag_id),
  };
};
