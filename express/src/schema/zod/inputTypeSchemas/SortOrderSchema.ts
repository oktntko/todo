import { z } from '~/lib/zod.js';

export const SortOrderSchema = z.enum(['asc', 'desc']);

export default SortOrderSchema;
