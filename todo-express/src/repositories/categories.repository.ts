import { Category, Prisma } from "@prisma/client";
import ORM from "~/arch/ORM";
import dayjs from "~/libs/dayjs";
import {
  AlreadyExistsError,
  NotExistsError,
  UpdateConflictsError,
} from "~/middlewares/ErrorHandler";
import log from "~/middlewares/log";

const createCategory = async (
  category: Omit<Category, "category_id" | "created_at" | "updated_at">
) => {
  log.debug("createCategory");

  return ORM.category.create({
    select: {
      category_id: true,
      category_name: true,
      color: true,
      order: true,
      updated_at: true,
    },
    data: {
      category_name: category.category_name,
      color: category.color,
      order: category.order,
    },
  });
};

const findManyCategory = async (where?: Prisma.CategoryWhereInput) => {
  log.debug("findManyCategory");

  return ORM.category.findMany({
    select: {
      category_id: true,
      category_name: true,
      color: true,
      order: true,
      updated_at: true,
    },
    where,
    orderBy: {
      order: "asc",
    },
  });
};

const findUniqueCategory = async (where: RequireOne<Prisma.CategoryWhereUniqueInput>) => {
  log.debug("findUniqueCategory");

  return ORM.category.findUnique({
    select: {
      category_id: true,
      category_name: true,
      color: true,
      order: true,
      updated_at: true,
    },
    where,
  });
};

const updateCategory = async (
  where: RequireOne<Prisma.CategoryWhereUniqueInput>,
  category: Omit<Category, "category_id" | "created_at" | "updated_at">
) => {
  log.debug("updateCategory");

  return ORM.category.update({
    select: {
      category_id: true,
      category_name: true,
      color: true,
      order: true,
      updated_at: true,
    },
    data: {
      category_name: category.category_name,
      color: category.color,
      order: category.order,
    },
    where,
  });
};

const deleteCategory = async (where: RequireOne<Prisma.CategoryWhereUniqueInput>) => {
  log.debug("deleteCategory");

  return ORM.category.delete({
    select: {
      category_id: true,
      category_name: true,
      color: true,
      order: true,
      updated_at: true,
    },
    where,
  });
};

const checkDuplicate = async (
  where: Pick<Required<Prisma.CategoryWhereUniqueInput>, "category_name">,
  category_id?: number
) => {
  const duplicate = await findUniqueCategory(where);
  if (duplicate && (category_id == null || duplicate.category_id !== category_id)) {
    throw new AlreadyExistsError();
  }

  return duplicate;
};

const checkPreviousVersion = async (
  where: Pick<Required<Prisma.CategoryWhereUniqueInput>, "category_id">,
  updated_at: string
) => {
  const previous = await findUniqueCategory(where);

  if (!previous) {
    throw new NotExistsError();
  } else if (!dayjs(previous.updated_at).isSame(updated_at)) {
    throw new UpdateConflictsError();
  }

  return previous;
};

const updateCategoryOrder = async (category: Pick<Category, "category_id" | "order">) => {
  log.debug("updateCategoryOrder");

  return ORM.category.update({
    select: {
      category_id: true,
      category_name: true,
      color: true,
      order: true,
      updated_at: true,
    },
    data: {
      order: category.order,
    },
    where: {
      category_id: category.category_id,
    },
  });
};

export const CategoriesRepository = {
  createCategory,
  findManyCategory,
  findUniqueCategory,
  updateCategory,
  deleteCategory,
  checkDuplicate,
  checkPreviousVersion,
  updateCategoryOrder,
} as const;
