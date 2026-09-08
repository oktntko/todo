import { z } from '@todo/lib';

export const OkSchema = z.object({
  ok: z.literal(true),
});
