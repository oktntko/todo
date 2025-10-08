import { z } from '@todo/lib/zod';
import { WhiteboardSchema } from '@todo/prisma/schema';

const createInput = WhiteboardSchema.omit({
  whiteboard_id: true,

  owner_id: true,
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

const updateInput = createInput.merge(deleteInput);

const upsertInput = z.object({
  whiteboard_id: WhiteboardSchema.shape.whiteboard_id.nullish(),
  whiteboard_content: WhiteboardSchema.shape.whiteboard_content,
});

const getInput = WhiteboardSchema.pick({
  whiteboard_id: true,
});

const reorderInput = WhiteboardSchema.pick({
  whiteboard_id: true,
  whiteboard_order: true,
});
const reorderInputList = reorderInput.array();

export const WhiteboardRouterSchema = {
  createInput,
  deleteInput,
  updateInput,
  upsertInput,
  getInput,
  reorderInput,
  reorderInputList,
};
