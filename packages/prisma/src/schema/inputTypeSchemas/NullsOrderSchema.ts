import { z } from '@repo/lib/zod';

export const NullsOrderSchema = z.enum(['first', 'last']);

export default NullsOrderSchema;
