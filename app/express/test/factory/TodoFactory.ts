import { z } from '@todo/lib/zod';
import { TodoSchema } from '@todo/prisma/schema';

import { PrismaClient } from '~/middleware/prisma';

export const TodoFactory = {
  create,
};

export async function create(
  prisma: PrismaClient,
  {
    todo_id = crypto.randomUUID(),
    created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
    updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',

    ...overrides
  }: Partial<Omit<z.infer<typeof TodoSchema>, 'group_id'>> &
    Pick<z.infer<typeof TodoSchema>, 'group_id'>,
) {
  return prisma.todo.create({
    data: {
      todo_id,
      created_by,
      updated_by,

      ...overrides,
    },
    include: {
      group: true,
      file_list: true,
    },
  });
}
