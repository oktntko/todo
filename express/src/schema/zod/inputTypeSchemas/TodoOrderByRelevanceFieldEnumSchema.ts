import { z } from '~/lib/zod.js';

export const TodoOrderByRelevanceFieldEnumSchema = z.enum([
  'todo_id',
  'title',
  'description',
  'begin_date',
  'begin_time',
  'limit_date',
  'limit_time',
]);

export default TodoOrderByRelevanceFieldEnumSchema;
