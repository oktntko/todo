import { DateSchema, TimeSchema, z } from '@repo/lib/zod';

/////////////////////////////////////////
// TODO SCHEMA
/////////////////////////////////////////

export const TodoSchema = z.object({
  todo_id: z.string().uuid(),
  space_id: z.number().int(),
  title: z.string().trim().max(100),
  description: z.string().max(400),
  begin_date: DateSchema.or(z.literal('')),
  begin_time: TimeSchema.or(z.literal('')),
  limit_date: DateSchema.or(z.literal('')),
  limit_time: TimeSchema.or(z.literal('')),
  order: z.number().int(),
  done_at: z.coerce.date().nullable(),
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
