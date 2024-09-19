import { z } from '~/lib/zod.js';

export const TodoStatus = ['active', 'done'] as const;
export const TodoStatusSchema = z.enum(TodoStatus);
