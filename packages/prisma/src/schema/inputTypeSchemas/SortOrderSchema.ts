import { z } from '@repo/lib/zod';

export const SortOrderSchema = z.enum(['asc', 'desc']);

export default SortOrderSchema;
