import { z } from '~/lib/zod.js';
import { TodoStatusSchema } from '~/schema/option/OptionTodoStatus.js';
import { SortOrderSchema } from '~/schema/zod/inputTypeSchemas/SortOrderSchema.js';
import { TodoScalarFieldEnumSchema } from '~/schema/zod/inputTypeSchemas/TodoScalarFieldEnumSchema.js';
import { FileSchema } from '~/schema/zod/modelSchema/FileSchema.js';
import { SpaceSchema } from '~/schema/zod/modelSchema/SpaceSchema.js';
import { TagSchema } from '~/schema/zod/modelSchema/TagSchema.js';
import { TodoSchema } from '~/schema/zod/modelSchema/TodoSchema.js';

export const TodoOutputSchema = TodoSchema.merge(
  z.object({
    space: z.lazy(() => SpaceSchema),
    tag_list: z.lazy(() => TagSchema).array(),
    file_list: z.lazy(() => FileSchema).array(),
  }),
);

const upsertInput = TodoSchema.omit({
  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
}).merge(
  z.object({
    tag_list: TagSchema.pick({ tag_id: true }).array(),
  }),
);

const createInput = TodoSchema.omit({
  todo_id: true,
  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
}).merge(
  z.object({
    tag_list: TagSchema.pick({ tag_id: true }).array(),
  }),
);

const updateInput = createInput.partial().merge(
  TodoSchema.pick({
    todo_id: true,
    updated_at: true,
  }),
);

const updateManyInput = createInput
  .omit({ tag_list: true })
  .partial()
  .merge(
    z.object({
      list: TodoSchema.pick({
        todo_id: true,
        updated_at: true,
      })
        .array()
        .min(1),
    }),
  );

const getInput = TodoSchema.pick({
  todo_id: true,
});

const deleteManyInput = getInput.array().min(1);

const listInput = z.object({
  space_id: z.number(),
  todo_status: TodoStatusSchema,
});

const listOutput = z.array(TodoOutputSchema);

const searchInput = z.object({
  where: z.object({
    space_id: z.number().nullable(),
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
  listOutput,
  searchInput,
  searchOutput,
};
