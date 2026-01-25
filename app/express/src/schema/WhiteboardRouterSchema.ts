import { z } from '@todo/lib/zod';
import { WhiteboardSchema } from '@todo/prisma/schema';

const getInput = WhiteboardSchema.pick({
  whiteboard_id: true,
});

const getOutput = WhiteboardSchema;

const createInput = WhiteboardSchema.omit({
  whiteboard_id: true,

  whiteboard_order: true,

  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
});

const deleteInput = WhiteboardSchema.pick({
  whiteboard_id: true,
  updated_at: true,
});

const updateInput = createInput.extend(deleteInput.shape).omit({
  space_id: true,
});

const applyChangeInput = WhiteboardSchema.pick({
  whiteboard_id: true,
  whiteboard_content: true,
});

const orderInput = WhiteboardSchema.pick({
  whiteboard_id: true,
  whiteboard_order: true,
});
const reorderInput = z.object({
  space_id: WhiteboardSchema.shape.space_id,
  order: orderInput.array().min(1),
});

export const WhiteboardRouterSchema = {
  getInput,
  getOutput,
  createInput,
  deleteInput,
  updateInput,
  applyChangeInput,
  reorderInput,
};
