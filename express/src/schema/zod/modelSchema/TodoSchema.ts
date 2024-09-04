import { z } from '~/lib/zod.js';
import { DateSchema, TimeSchema } from '../../_schema.js';
import type { FileWithRelations } from './FileSchema.js';
import { FileWithRelationsSchema } from './FileSchema.js';
import type { SpaceWithRelations } from './SpaceSchema.js';
import { SpaceWithRelationsSchema } from './SpaceSchema.js';
import type { TagWithRelations } from './TagSchema.js';
import { TagWithRelationsSchema } from './TagSchema.js';

/////////////////////////////////////////
// TODO SCHEMA
/////////////////////////////////////////

export const TodoSchema = z.object({
  todo_id: z.string().uuid(),
  space_id: z.number().int(),
  title: z.string().trim().max(100),
  description: z.string().trim().max(400),
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

/////////////////////////////////////////
// TODO RELATION SCHEMA
/////////////////////////////////////////

export type TodoRelations = {
  space: SpaceWithRelations;
  tag_list: TagWithRelations[];
  file_list: FileWithRelations[];
};

export type TodoWithRelations = z.infer<typeof TodoSchema> & TodoRelations;

export const TodoWithRelationsSchema: z.ZodType<TodoWithRelations> = TodoSchema.merge(
  z.object({
    space: z.lazy(() => SpaceWithRelationsSchema),
    tag_list: z.lazy(() => TagWithRelationsSchema).array(),
    file_list: z.lazy(() => FileWithRelationsSchema).array(),
  }),
);

export default TodoSchema;
