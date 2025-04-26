import { z } from '~/lib/zod.js';
import { ColorSchema } from '../../_schema.js';
import type { TodoWithRelations } from './TodoSchema.js';
import { TodoWithRelationsSchema } from './TodoSchema.js';
import type { UserWithRelations } from './UserSchema.js';
import { UserWithRelationsSchema } from './UserSchema.js';

/////////////////////////////////////////
// SPACE SCHEMA
/////////////////////////////////////////

export const SpaceSchema = z.object({
  space_id: z.number().int(),
  owner_id: z.number().int(),
  space_name: z.string().trim().min(1).max(100),
  space_description: z.string().max(400),
  space_order: z.number().int(),
  space_image: z.string().trim().max(15000),
  space_color: ColorSchema.or(z.literal('')),
  created_at: z.coerce.date(),
  created_by: z.number().int(),
  updated_at: z.coerce.date(),
  updated_by: z.number().int(),
});

export type Space = z.infer<typeof SpaceSchema>;

/////////////////////////////////////////
// SPACE CUSTOM VALIDATORS SCHEMA
/////////////////////////////////////////

export const SpaceCustomValidatorsSchema = SpaceSchema;

export type SpaceCustomValidators = z.infer<typeof SpaceCustomValidatorsSchema>;

/////////////////////////////////////////
// SPACE RELATION SCHEMA
/////////////////////////////////////////

export type SpaceRelations = {
  owner: UserWithRelations;
  todo_list: TodoWithRelations[];
};

export type SpaceWithRelations = z.infer<typeof SpaceSchema> & SpaceRelations;

export const SpaceWithRelationsSchema: z.ZodType<SpaceWithRelations> = SpaceSchema.merge(
  z.object({
    owner: z.lazy(() => UserWithRelationsSchema),
    todo_list: z.lazy(() => TodoWithRelationsSchema).array(),
  }),
);

export default SpaceSchema;
