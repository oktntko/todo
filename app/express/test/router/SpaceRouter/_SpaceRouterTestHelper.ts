import { SpaceUserRole } from '@todo/prisma/client';

import { PrismaClient } from '~/middleware/prisma';

export async function createTestSpace(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  role: SpaceUserRole | undefined,
  overrides?: {
    space_name?: string;
    space_description?: string;
    space_image?: string;
    space_color?: string;
  },
) {
  const space_id = crypto.randomUUID();

  return prisma.space.create({
    data: {
      space_id,
      space_name: overrides?.space_name ?? `test-space-${space_id}`,
      space_description: overrides?.space_description ?? 'test description',
      space_image: overrides?.space_image ?? '',
      space_color: overrides?.space_color ?? '#FFFFFF',

      created_by: user_id,
      updated_by: user_id,
      space_user_list: role
        ? {
            create: {
              role,
              user_id,
            },
          }
        : undefined,
    },
  });
}
