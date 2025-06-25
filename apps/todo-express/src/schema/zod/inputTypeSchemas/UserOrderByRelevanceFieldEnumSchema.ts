import { z } from '~/lib/zod';

export const UserOrderByRelevanceFieldEnumSchema = z.enum([
  'email',
  'password',
  'username',
  'twofa_secret',
]);

export default UserOrderByRelevanceFieldEnumSchema;
