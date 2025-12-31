import { GroupSchema } from '@todo/prisma/schema';

const createInput = GroupSchema.omit({
  group_id: true,

  owner_id: true,
  group_order: true,

  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
});

const deleteInput = GroupSchema.pick({
  group_id: true,
  updated_at: true,
});

const updateInput = createInput.extend(deleteInput.shape);

const getInput = GroupSchema.pick({
  group_id: true,
});

const getOutput = GroupSchema;

const reorderInput = GroupSchema.pick({
  group_id: true,
  group_order: true,
});
const reorderInputList = reorderInput.array();

export const GroupRouterSchema = {
  createInput,
  deleteInput,
  updateInput,
  getInput,
  getOutput,
  reorderInput,
  reorderInputList,
};
