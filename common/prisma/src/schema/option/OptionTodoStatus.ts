import { z } from '@todo/lib';

export const TodoStatusList = ['active', 'done'] as const;
export const TodoStatusSchema = z.enum(TodoStatusList);
