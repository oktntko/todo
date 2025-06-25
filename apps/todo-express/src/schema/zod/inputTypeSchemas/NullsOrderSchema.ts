import { z } from '~/lib/zod';

export const NullsOrderSchema = z.enum(['first', 'last']);

export default NullsOrderSchema;
