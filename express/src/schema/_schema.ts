import dayjs from 'dayjs';
import { z } from '~/lib/zod.js';

export const YYYYMMDDSchema = z
  .string()
  .pipe(z.coerce.date())
  .transform((data) => dayjs(data).format('YYYY-MM-DD'));

export const OmitCommonColumn = {
  created_at: true,
  updated_at: true,
} as const;
