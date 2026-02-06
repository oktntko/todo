import { SpaceSchema } from '@todo/prisma/schema';

const getInput = SpaceSchema.pick({
  space_id: true,
});

const getOutput = SpaceSchema;

const createInput = SpaceSchema.omit({
  space_id: true,

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

export const SpaceRouterSchema = {
  getInput,
  getOutput,
  createInput,
  deleteInput,
  updateInput,
};
