import { z } from '@todo/lib/zod';

export const AichatRoleList = [
  'developer',
  'system',
  'user',
  'assistant',
  // 'tool',
  // 'function',
] as const;
export const AichatRoleSchema = z.enum(AichatRoleList);
