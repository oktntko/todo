import { z } from '~/lib/zod.js';
import { ColorSchema } from '../../_schema.js';
import type { SpaceWithRelations } from './SpaceSchema.js';
import { SpaceWithRelationsSchema } from './SpaceSchema.js';
import type { TodoWithRelations } from './TodoSchema.js';
import { TodoWithRelationsSchema } from './TodoSchema.js';
import type { UserWithRelations } from './UserSchema.js';
import { UserWithRelationsSchema } from './UserSchema.js';

/////////////////////////////////////////
// TAG SCHEMA
/////////////////////////////////////////

export const TagSchema = z.object({
  tag_id: z.number().int(),
  owner_id: z.number().int(),
  tag_name: z.string().trim().min(1).max(100),
  tag_description: z.string().trim().max(400),
  tag_color: ColorSchema.or(z.literal('')),
  tag_order: z.number().int(),
  created_at: z.coerce.date(),
  created_by: z.number().int(),
  updated_at: z.coerce.date(),
  updated_by: z.number().int(),
});

export type Tag = z.infer<typeof TagSchema>;

/////////////////////////////////////////
// TAG CUSTOM VALIDATORS SCHEMA
/////////////////////////////////////////

export const TagCustomValidatorsSchema = TagSchema;

export type TagCustomValidators = z.infer<typeof TagCustomValidatorsSchema>;

/////////////////////////////////////////
// TAG RELATION SCHEMA
/////////////////////////////////////////

export type TagRelations = {
  owner: UserWithRelations;
  todo_list: TodoWithRelations[];
  space_list: SpaceWithRelations[];
};

export type TagWithRelations = z.infer<typeof TagSchema> & TagRelations;

export const TagWithRelationsSchema: z.ZodType<TagWithRelations> = TagSchema.merge(
  z.object({
    owner: z.lazy(() => UserWithRelationsSchema),
    todo_list: z.lazy(() => TodoWithRelationsSchema).array(),
    space_list: z.lazy(() => SpaceWithRelationsSchema).array(),
  }),
);

export default TagSchema;
