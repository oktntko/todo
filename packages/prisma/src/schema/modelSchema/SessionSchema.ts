import { z } from '@repo/lib/zod';

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

export default SessionSchema;
