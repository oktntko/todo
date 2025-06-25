import { z } from '~/lib/zod';

export const SortOrderSchema = z.enum(['asc', 'desc']);

export default SortOrderSchema;
