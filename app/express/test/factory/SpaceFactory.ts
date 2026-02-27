import { z } from '@todo/lib/zod';
import { SpaceUserRole } from '@todo/prisma/client';
import { SpaceSchema } from '@todo/prisma/schema';

import { PrismaClient } from '~/middleware/prisma';

export const SpaceFactory = {
  create,
};

async function create(
  prisma: PrismaClient,
  {
    space_id = crypto.randomUUID(),
    space_name = `test-space-${space_id}`,
    created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
    updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',

    user_id,
    role,
    ...overrides
  }: Partial<
    z.infer<typeof SpaceSchema> & {
      user_id: string | undefined;
      role: SpaceUserRole | undefined;
    }
  > = {},
) {
  return prisma.space.create({
    data: {
      space_id,
      space_name,
      created_by,
      updated_by,

      ...overrides,
      space_user_list:
        user_id && role
          ? {
              create: {
                user_id,
                role,
              },
            }
          : undefined,
    },
  });
}
