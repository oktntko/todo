import { z } from '@todo/lib/zod';
import { WhiteboardSchema } from '@todo/prisma/schema';

import { PrismaClient } from '~/middleware/prisma';

export const WhiteboardFactory = {
  create,
};

export async function create(
  prisma: PrismaClient,
  {
    whiteboard_id = crypto.randomUUID(),
    whiteboard_name = `test-whiteboard-${whiteboard_id}`,
    created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
    updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',

    ...overrides
  }: Partial<Omit<z.infer<typeof WhiteboardSchema>, 'space_id'>> &
    Pick<z.infer<typeof WhiteboardSchema>, 'space_id'>,
) {
  return prisma.whiteboard.create({
    data: {
      whiteboard_id,
      whiteboard_name,
      created_by,
      updated_by,

      ...overrides,
    },
  });
}
