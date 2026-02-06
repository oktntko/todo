import { z } from '@todo/lib/zod';
import {
  FileSchema,
  GroupSchema,
  SortOrderSchema,
  TodoScalarFieldEnumSchema,
  TodoSchema,
  TodoStatusSchema,
} from '@todo/prisma/schema';

const getInput = TodoSchema.pick({
  todo_id: true,
});

const getOutput = TodoSchema.extend({
  group: z.lazy(() => GroupSchema),
  file_list: z.lazy(() => FileSchema).array(),
});

const listInput = z.object({
  space_id: GroupSchema.shape.space_id,
  group_id_list: GroupSchema.shape.group_id.array().default([]),
  todo_status: TodoStatusSchema.default('active'),
});

const searchInput = z.object({
  space_id: GroupSchema.shape.space_id,
  where: z.object({
    group_id_list: GroupSchema.shape.group_id.array().default([]),
    todo_keyword: z.string().trim().max(255),
    todo_status: TodoStatusSchema.array(),
  }),
  sort: z.object({
    field: z.enum([...TodoScalarFieldEnumSchema.options, 'group']),
    order: SortOrderSchema,
  }),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
});

const searchOutput = z.object({
  total: z.number(),
  todo_list: z.array(getOutput),
});

const createInput = TodoSchema.omit({
  todo_id: true,
  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
});

const deleteInput = TodoSchema.pick({
  todo_id: true,
  updated_at: true,
});

const updateInput = createInput.extend(deleteInput.shape);

const applyChangeInput = createInput.extend(getInput.shape);

const updateManyInput = z.object({
  space_id: GroupSchema.shape.space_id,
  data: createInput.partial(),
  target_list: deleteInput.array().min(1),
});

const deleteManyInput = z.object({
  space_id: GroupSchema.shape.space_id,
  target_list: deleteInput.array().min(1),
});

export const TodoRouterSchema = {
  getInput,
  getOutput,
  listInput,
  searchInput,
  searchOutput,
  createInput,
  deleteInput,
  updateInput,
  applyChangeInput,
  updateManyInput,
  deleteManyInput,
};
