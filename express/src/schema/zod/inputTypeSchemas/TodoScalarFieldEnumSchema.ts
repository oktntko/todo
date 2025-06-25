import { z } from '~/lib/zod';

export const TodoScalarFieldEnumSchema = z.enum([
  'todo_id',
  'space_id',
  'title',
  'description',
  'begin_date',
  'begin_time',
  'limit_date',
  'limit_time',
  'order',
  'done_at',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
]);

export default TodoScalarFieldEnumSchema;
