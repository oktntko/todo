import { z } from '~/lib/zod.js';

export const TodoScalarFieldEnumSchema = z.enum([
  'todo_id',
  'yarukoto',
  'kizitu',
  'description',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
]);

export default TodoScalarFieldEnumSchema;
