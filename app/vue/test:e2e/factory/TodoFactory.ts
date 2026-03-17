import { z } from '@todo/lib/zod';
import { TodoSchema } from '@todo/prisma/schema';

export const TodoFactory = {
  create,
};

function create({
  group_id = crypto.randomUUID(),

  todo_id = crypto.randomUUID(),
  title = `title-${todo_id}`,
  description = `description-${todo_id}`,
  begin_date = `2025-10-00`,
  begin_time = `10:00`,
  limit_date = `2025-12-00`,
  limit_time = `12:00`,
  done_at = null,
  order = 1,

  created_at = new Date(),
  created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
  updated_at = new Date(),
  updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
}: Partial<z.infer<typeof TodoSchema>>): z.infer<typeof TodoSchema> {
  return {
    group_id,

    todo_id,
    title,
    description,
    begin_date,
    begin_time,
    limit_date,
    limit_time,
    done_at,
    order,

    created_at,
    created_by,
    updated_at,
    updated_by,
  };
}
