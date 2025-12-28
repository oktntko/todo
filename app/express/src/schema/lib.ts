import { z } from '@todo/lib/zod';

export const OkSchema = z.object({
  ok: z.literal(true),
});
