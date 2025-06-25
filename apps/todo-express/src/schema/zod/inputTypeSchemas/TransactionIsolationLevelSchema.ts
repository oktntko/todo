import { z } from '~/lib/zod';

export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
]);

export default TransactionIsolationLevelSchema;
