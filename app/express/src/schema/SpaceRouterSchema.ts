import { SpaceSchema } from '@todo/prisma/schema';

const getInput = SpaceSchema.pick({
  space_id: true,
});

const getOutput = SpaceSchema.omit({
  aichat_api_key: true,
});

const createInput = SpaceSchema.omit({
  space_id: true,

  aichat_enable: true,
  aichat_api_key: true,

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

const enableAichatInput = SpaceSchema.pick({
  aichat_api_key: true,
}).extend(deleteInput.shape);

export const SpaceRouterSchema = {
  getInput,
  getOutput,
  createInput,
  deleteInput,
  updateInput,
  enableAichatInput,
};
