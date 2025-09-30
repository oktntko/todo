import { z } from '@todo/lib/zod';
import { SpaceSchema } from '@todo/prisma/schema';

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

export const SpaceSchemaAndCount = SpaceSchema.and(
  z.object({
    _count: z
      .object({
        todo_list: z.number(),
      })
      .optional(),
  }),
);

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
  reorderInput,
  reorderInputList,
};
