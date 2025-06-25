import { z } from '~/lib/zod';

export const TodoStatusList = ['active', 'done'] as const;
export const TodoStatusSchema = z.enum(TodoStatusList);
