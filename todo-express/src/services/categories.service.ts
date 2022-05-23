import { Category } from "@prisma/client";
import log from "~/middlewares/log";
import { CategoriesRepository } from "~/repositories/categories.repository";

// # POST /api/categories
const postCategory = async (
  category: Omit<Category, "category_id" | "created_at" | "updated_at">
) => {
  log.debug("postCategory", category);

  return CategoriesRepository.createCategory(category);
};

// # GET /api/categories
const getCategories = async () => {
  log.debug("getCategories");

  return CategoriesRepository.findManyCategory();
};

// # GET /api/categories/:category_id
const getCategory = async (category_id: number) => {
  log.debug("getCategory", category_id);

  return CategoriesRepository.findUniqueCategory({ category_id });
};

// # PUT /api/categories/:category_id
const putCategory = async (
  category_id: number,
  category: Omit<Category, "category_id" | "created_at" | "updated_at">,
  updated_at: Date
) => {
  log.debug("putCategory", category_id, category, updated_at);

  return CategoriesRepository.updateCategory({ category_id }, category);
};

// # DELETE /api/categories/:category_id
const deleteCategory = async (category_id: number, updated_at: Date) => {
  log.debug("deleteCategory", category_id, updated_at);

  return CategoriesRepository.deleteCategory({ category_id });
};

export const CategoriesService = {
  postCategory,
  getCategories,
  getCategory,
  putCategory,
  deleteCategory,
} as const;
