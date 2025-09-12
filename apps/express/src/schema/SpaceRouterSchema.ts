import { z } from '@todo/lib/zod';
import { SortOrderSchema, SpaceScalarFieldEnumSchema, SpaceSchema } from '@todo/prisma/schema';

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
  space_list: z.array(
    SpaceSchema.and(
      z.object({
        _count: z
          .object({
            todo_list: z.number(),
          })
          .optional(),
      }),
    ),
  ),
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
