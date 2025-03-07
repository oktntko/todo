import { z } from '~/lib/zod.js';

export const NullsOrderSchema = z.enum(['first', 'last']);

export default NullsOrderSchema;
