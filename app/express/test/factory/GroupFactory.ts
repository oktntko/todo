import { z } from '@todo/lib/zod';
import { GroupSchema } from '@todo/prisma/schema';

import { PrismaClient } from '~/middleware/prisma';

export const GroupFactory = {
  create,
};

async function create(
  prisma: PrismaClient,
  {
    group_id = crypto.randomUUID(),
    group_name = `test-group-${group_id}`,
    created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
    updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',

    ...overrides
  }: Partial<Omit<z.infer<typeof GroupSchema>, 'space_id'>> &
    Pick<z.infer<typeof GroupSchema>, 'space_id'>,
) {
  return prisma.group.create({
    data: {
      group_id,
      group_name,
      created_by,
      updated_by,

      ...overrides,
    },
  });
}
