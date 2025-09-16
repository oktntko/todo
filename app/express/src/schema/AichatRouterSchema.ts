import { z } from '@todo/lib/zod';

const listInput = z.object({});

export const AichatRoleSchema = z.enum([
  'developer',
  'system',
  'user',
  'assistant',
  // 'tool',
  // 'function',
]);

export const MessageSchema = z.object({
  role: AichatRoleSchema,
  content: z.string(),
});

export const MessagesSchema = z
  .object({
    message: MessageSchema,
  })
  .array();

const chatInput = z.object({
  messages: MessagesSchema,
  message: MessageSchema,
});

export const AichatRouterSchema = {
  listInput,
  chatInput,
};
