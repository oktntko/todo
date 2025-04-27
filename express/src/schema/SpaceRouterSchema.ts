import { z } from '~/lib/zod.js';
import { SortOrderSchema } from '~/schema/zod/inputTypeSchemas/SortOrderSchema.js';
import { SpaceScalarFieldEnumSchema } from '~/schema/zod/inputTypeSchemas/SpaceScalarFieldEnumSchema.js';
import { SpaceSchema } from '~/schema/zod/modelSchema/SpaceSchema.js';

const createInput = SpaceSchema.omit({
  space_id: true,

  owner_id: true,
  space_order: true,

  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
});

const deleteInput = SpaceSchema.pick({
  space_id: true,
  updated_at: true,
});

const updateInput = createInput.merge(deleteInput);

const getInput = SpaceSchema.pick({
  space_id: true,
});

const listInput = z.object({
  where: z.object({
    space_keyword: z.string().trim().max(255),
  }),
  sort: z.object({
    field: SpaceScalarFieldEnumSchema,
    order: SortOrderSchema,
  }),
});

const listOutput = z.object({
  total: z.number(),
  space_list: z.array(SpaceSchema),
});

const reorderInput = SpaceSchema.pick({
  space_id: true,
  space_order: true,
});
const reorderInputList = reorderInput.array();

export const SpaceRouterSchema = {
  createInput,
  deleteInput,
  updateInput,
  getInput,
  listInput,
  listOutput,
  reorderInput,
  reorderInputList,
};
