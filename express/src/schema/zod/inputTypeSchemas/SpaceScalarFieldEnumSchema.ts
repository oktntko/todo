import { z } from '~/lib/zod.js';

export const SpaceScalarFieldEnumSchema = z.enum([
  'space_id',
  'owner_id',
  'space_name',
  'space_description',
  'space_order',
  'space_image',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
]);

export default SpaceScalarFieldEnumSchema;
