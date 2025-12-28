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

const updateInput = createInput.extend(deleteInput.shape);

const getInput = SpaceSchema.pick({
  space_id: true,
});

const getOutput = SpaceSchema;

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
  getOutput,
  reorderInput,
  reorderInputList,
};
