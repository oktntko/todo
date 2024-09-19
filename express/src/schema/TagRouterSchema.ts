import { z } from '~/lib/zod.js';
import { SortOrderSchema } from '~/schema/zod/inputTypeSchemas/SortOrderSchema.js';
import { TagScalarFieldEnumSchema } from '~/schema/zod/inputTypeSchemas/TagScalarFieldEnumSchema.js';
import { TagSchema } from '~/schema/zod/modelSchema/TagSchema.js';

const createInput = TagSchema.omit({
  tag_id: true,

  tag_order: true,

  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
});

const deleteInput = TagSchema.pick({
  tag_id: true,
  updated_at: true,
});

const updateInput = createInput.merge(deleteInput);

const getInput = TagSchema.pick({
  tag_id: true,
});

const listInput = z.object({
  where: z.object({
    space_id: z.number().array().optional(),
    tag_keyword: z.string().trim().max(255).optional(),
  }),
  sort: z.object({
    field: TagScalarFieldEnumSchema,
    order: SortOrderSchema,
  }),
});

const listOutput = z.object({
  total: z.number(),
  tag_list: z.array(TagSchema),
});

export const TagRouterSchema = {
  createInput,
  deleteInput,
  updateInput,
  getInput,
  listInput,
  listOutput,
};
