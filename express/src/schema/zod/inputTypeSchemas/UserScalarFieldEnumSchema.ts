import { z } from '~/lib/zod.js';

export const UserScalarFieldEnumSchema = z.enum([
  'user_id',
  'email',
  'password',
  'username',
  'description',
  'created_at',
  'updated_at',
]);

export default UserScalarFieldEnumSchema;
