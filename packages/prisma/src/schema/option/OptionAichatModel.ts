import { z } from '@todo/lib/zod';

export const AichatModelList = [
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4.1-2025-04-14',
  'gpt-4.1-mini-2025-04-14',
  'gpt-4.1-nano-2025-04-14',
] as const;
export const AichatModelSchema = z.enum(AichatModelList);
