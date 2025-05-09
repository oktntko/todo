import { z } from '~/lib/zod.js';

export const SpaceOrderByRelevanceFieldEnumSchema = z.enum([
  'space_name',
  'space_description',
  'space_image',
  'space_color',
]);

export default SpaceOrderByRelevanceFieldEnumSchema;
