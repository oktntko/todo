import { z } from '~/lib/zod.js';

export const TagScalarFieldEnumSchema = z.enum([
  'tag_id',
  'owner_id',
  'tag_name',
  'tag_description',
  'tag_color',
  'tag_order',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
]);

export default TagScalarFieldEnumSchema;
