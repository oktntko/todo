import { z } from '@todo/lib/zod';
import {
  FileSchema,
  GroupSchema,
  SortOrderSchema,
  TodoScalarFieldEnumSchema,
  TodoSchema,
  TodoStatusSchema,
} from '@todo/prisma/schema';

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

const getOutput = TodoSchema.extend({
  group: z.lazy(() => GroupSchema),
  file_list: z.lazy(() => FileSchema).array(),
});

const deleteManyInput = getInput.array().min(1);

const listInput = z.object({
  group_id_list: z.number().array().default([]),
  todo_status: TodoStatusSchema.default('active'),
});

const searchInput = z.object({
  where: z.object({
    group_id_list: z.number().array().default([]),
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

export const TodoRouterSchema = {
  upsertInput,
  createInput,
  updateInput,
  updateManyInput,
  getInput,
  getOutput,
  deleteManyInput,
  listInput,
  searchInput,
  searchOutput,
};
