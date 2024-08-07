import { z } from '~/lib/zod.js';
import { YYYYMMDDSchema } from '../../_schema.js';

/////////////////////////////////////////
// TODO SCHEMA
/////////////////////////////////////////

export const TodoSchema = z.object({
  todo_id: z.number().int(),
  yarukoto: z.string().trim().min(1).max(100),
  kizitu: YYYYMMDDSchema.or(z.literal('')),
  description: z.string().trim().max(400),
  created_at: z.coerce.date(),
  created_by: z.number().int(),
  updated_at: z.coerce.date(),
  updated_by: z.number().int(),
});

export type Todo = z.infer<typeof TodoSchema>;

/////////////////////////////////////////
// TODO CUSTOM VALIDATORS SCHEMA
/////////////////////////////////////////

export const TodoCustomValidatorsSchema = TodoSchema;

export type TodoCustomValidators = z.infer<typeof TodoCustomValidatorsSchema>;

export default TodoSchema;
