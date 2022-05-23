import { Category, Prisma } from "@prisma/client";
import ORM from "~/arch/ORM";
import log from "~/middlewares/log";

const createCategory = async (
  category: Omit<Category, "category_id" | "created_at" | "updated_at">
) => {
  log.debug("createCategory");

  return ORM.category.create({
    select: {
      category_id: true,
      category_name: true,
      updated_at: true,
    },
    data: category,
  });
};

const findManyCategory = async (where?: Prisma.CategoryWhereInput) => {
  log.debug("findManyCategory");

  return ORM.category.findMany({
    select: {
      category_id: true,
      category_name: true,
      updated_at: true,
    },
    where,
  });
};

const findUniqueCategory = async (where: RequireOne<Prisma.CategoryWhereUniqueInput>) => {
  log.debug("findUniqueCategory");

  return ORM.category.findUnique({
    select: {
      category_id: true,
      category_name: true,
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
      updated_at: true,
    },
    data: category,
    where,
  });
};

const deleteCategory = async (where: RequireOne<Prisma.CategoryWhereUniqueInput>) => {
  log.debug("deleteCategory");

  return ORM.category.delete({
    select: {
      category_id: true,
      category_name: true,
      updated_at: true,
    },
    where,
  });
};

export const CategoriesRepository = {
  createCategory,
  findManyCategory,
  findUniqueCategory,
  updateCategory,
  deleteCategory,
} as const;
