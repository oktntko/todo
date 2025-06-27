import { z } from '@repo/lib/zod';

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
]);

export default TransactionIsolationLevelSchema;
