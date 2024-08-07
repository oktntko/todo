import { z } from '~/lib/zod.js';

export const SessionScalarFieldEnumSchema = z.enum([
  'session_id',
  'session_key',
  'originalMaxAge',
  'expires',
  'user_id',
  'data',
  'created_at',
  'updated_at',
]);

export default SessionScalarFieldEnumSchema;
