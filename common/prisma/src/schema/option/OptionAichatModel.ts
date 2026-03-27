import { z } from '@todo/lib/zod';

export const AichatModelList = [
  'gpt-5.4',
  'gpt-5.4-mini',
  'gpt-5.4-nano',
  'gpt-5.4-mini-2026-03-17',
  'gpt-5.4-nano-2026-03-17',
  'gpt-5.1-mini',
  'gpt-4.1-mini',
] as const;
export const AichatModelSchema = z.enum(AichatModelList);
