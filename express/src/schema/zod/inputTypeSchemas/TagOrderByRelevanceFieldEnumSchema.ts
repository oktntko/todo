import { z } from '~/lib/zod.js';

export const TagOrderByRelevanceFieldEnumSchema = z.enum([
  'tag_name',
  'tag_description',
  'tag_color',
]);

export default TagOrderByRelevanceFieldEnumSchema;
