import { ColorSchema, z } from '@repo/lib/zod';

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

export default SpaceSchema;
