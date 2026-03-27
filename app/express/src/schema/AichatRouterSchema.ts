import { z } from '@todo/lib/zod';
import {
  AichatMessageSchema,
  AichatModelSchema,
  AichatSchema,
  UserSchema,
} from '@todo/prisma/schema';

const getInput = AichatSchema.pick({
  aichat_id: true,
});

const getOutput = AichatSchema;

const listInput = AichatSchema.pick({
  space_id: true,
});

const createInput = AichatSchema.omit({
  aichat_id: true,

  created_by: true,
  created_at: true,
  updated_by: true,
  updated_at: true,
});

const deleteInput = AichatSchema.pick({
  aichat_id: true,
  updated_at: true,
});

const updateInput = createInput.extend(deleteInput.shape).omit({
  space_id: true,
});

const MessageSchema = AichatMessageSchema.pick({
  role: true,
  content: true,
});

const listMessageInput = getInput;

const listMessageOutput = getOutput.extend({
  aichat_message_list: MessageSchema.extend({
    user: UserSchema.pick({
      username: true,
      avatar_image: true,
    }).nullable(),
  }).array(),
});

const PostMessage = z.object({
  content: z.string(),
  aichat_model: AichatModelSchema,
});

const postMessageInput = deleteInput.extend(PostMessage.shape);

export const AichatRouterSchema = {
  getInput,
  getOutput,
  listInput,
  createInput,
  deleteInput,
  updateInput,
  listMessageInput,
  listMessageOutput,
  postMessageInput,
  MessageSchema,
  PostMessage,
};
