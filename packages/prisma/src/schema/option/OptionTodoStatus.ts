import { z } from '@todo/lib/zod';

export const TodoStatusList = ['active', 'done'] as const;
export const TodoStatusSchema = z.enum(TodoStatusList);
