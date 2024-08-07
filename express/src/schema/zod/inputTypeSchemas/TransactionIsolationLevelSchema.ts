import { z } from '~/lib/zod.js';

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
]);

export default TransactionIsolationLevelSchema;
