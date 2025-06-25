import { z } from '~/lib/zod';
import type { UserWithRelations } from './UserSchema';
import { UserWithRelationsSchema } from './UserSchema';

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  session_id: z.number().int(),
  session_key: z.string(),
  /**
   * express-session
   */
  originalMaxAge: z.number().int().nullable(),
  expires: z.coerce.date().nullable(),
  /**
   * custom
   */
  user_id: z.number().int().nullable(),
  data: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Session = z.infer<typeof SessionSchema>;

/////////////////////////////////////////
// SESSION RELATION SCHEMA
/////////////////////////////////////////

export type SessionRelations = {
  user?: UserWithRelations | null;
};

export type SessionWithRelations = z.infer<typeof SessionSchema> & SessionRelations;

export const SessionWithRelationsSchema: z.ZodType<SessionWithRelations> = SessionSchema.merge(
  z.object({
    user: z.lazy(() => UserWithRelationsSchema).nullable(),
  }),
);

export default SessionSchema;
