import { z } from '@todo/lib/zod';
import { GroupSchema } from '@todo/prisma/schema';

const getInput = GroupSchema.pick({
  group_id: true,
});

const getOutput = GroupSchema;

const listInput = GroupSchema.pick({
  space_id: true,
});

const createInput = GroupSchema.omit({
  group_id: true,

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

const updateInput = createInput.extend(deleteInput.shape).omit({
  space_id: true,
});

const orderInput = GroupSchema.pick({
  group_id: true,
  group_order: true,
});
const reorderInput = z.object({
  space_id: GroupSchema.shape.space_id,
  order: orderInput.array().min(1),
});

export const GroupRouterSchema = {
  getInput,
  getOutput,
  listInput,
  createInput,
  deleteInput,
  updateInput,
  reorderInput,
};
