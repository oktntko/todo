import { z } from '~/lib/zod.js';
import { SortOrderSchema } from '~/schema/zod/inputTypeSchemas/SortOrderSchema.js';
import { TodoScalarFieldEnumSchema } from '~/schema/zod/inputTypeSchemas/TodoScalarFieldEnumSchema.js';
import { FileSchema } from '~/schema/zod/modelSchema/FileSchema.js';
import { TagSchema } from '~/schema/zod/modelSchema/TagSchema.js';
import { TodoSchema } from '~/schema/zod/modelSchema/TodoSchema.js';
import { TodoStatusSchema } from '~/schema/zod/option/OptionTodoStatus.js';

const upsertInput = TodoSchema.omit({
  order: true,

  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
}).merge(
  z.object({
    tag_list: TagSchema.pick({ tag_id: true }).array(),
  }),
);

const deleteInput = TodoSchema.pick({
  todo_id: true,
});

const getInput = TodoSchema.pick({
  todo_id: true,
});

const listInput = z.object({
  where: z.object({
    space_id: z.number().nullable(),
    todo_keyword: z.string().trim().max(255),
    todo_status: TodoStatusSchema,
  }),
  sort: z.object({
    field: TodoScalarFieldEnumSchema,
    order: SortOrderSchema,
  }),
});

export const TodoOutputSchema = TodoSchema.merge(
  z.object({
    tag_list: z.lazy(() => TagSchema).array(),
    file_list: z.lazy(() => FileSchema).array(),
  }),
);

const listOutput = z.object({
  total: z.number(),
  todo_list: z.array(TodoOutputSchema),
});

export const TodoRouterSchema = {
  upsertInput,
  deleteInput,
  getInput,
  listInput,
  listOutput,
};
