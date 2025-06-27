import { z } from '@repo/lib/zod';

export const UserScalarFieldEnumSchema = z.enum([
  'user_id',
  'email',
  'password',
  'username',
  'twofa_enable',
  'twofa_secret',
  'created_at',
  'updated_at',
]);

export default UserScalarFieldEnumSchema;
