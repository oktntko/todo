import { z } from '@todo/lib/zod';
import {
  FileSchema,
  SortOrderSchema,
  SpaceSchema,
  TodoScalarFieldEnumSchema,
  TodoSchema,
  TodoStatusSchema,
} from '@todo/prisma/schema';

export const TodoOutputSchema = TodoSchema.extend({
  space: z.lazy(() => SpaceSchema),
  file_list: z.lazy(() => FileSchema).array(),
});

const upsertInput = TodoSchema.omit({
  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
});

const createInput = TodoSchema.omit({
  todo_id: true,
  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
});

const updateInput = createInput.partial().extend(
  TodoSchema.pick({
    todo_id: true,
    updated_at: true,
  }).shape,
);

const updateManyInput = createInput.partial().extend({
  list: TodoSchema.pick({
    todo_id: true,
    updated_at: true,
  })
    .array()
    .min(1),
});

const getInput = TodoSchema.pick({
  todo_id: true,
});

const deleteManyInput = getInput.array().min(1);

const listInput = z.object({
  space_id_list: z.number().array().default([]),
  todo_status: TodoStatusSchema.default('active'),
});

const searchInput = z.object({
  where: z.object({
    space_id_list: z.number().array().default([]),
    todo_keyword: z.string().trim().max(255),
    todo_status: TodoStatusSchema.array(),
  }),
  sort: z.object({
    field: z.enum([...TodoScalarFieldEnumSchema.options, 'space']),
    order: SortOrderSchema,
  }),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
});

const searchOutput = z.object({
  total: z.number(),
  todo_list: z.array(TodoOutputSchema),
});

export const TodoRouterSchema = {
  upsertInput,
  createInput,
  updateInput,
  updateManyInput,
  getInput,
  deleteManyInput,
  listInput,
  searchInput,
  searchOutput,
};
