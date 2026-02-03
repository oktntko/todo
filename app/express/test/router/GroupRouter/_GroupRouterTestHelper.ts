import { SpaceUserRole } from '@todo/prisma/client';

import { PrismaClient } from '~/middleware/prisma';

import { createTestSpace } from '../SpaceRouter/_SpaceRouterTestHelper';

export async function createTestSpaceAndAddGroup(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  role: SpaceUserRole | undefined,
  overrides?: {
    group_name?: string;
    group_description?: string;
    group_image?: string;
    group_color?: string;
    group_order?: number;
  },
) {
  const space = await createTestSpace(prisma, { user_id }, role);

  return addTestGroup(prisma, { user_id }, space, overrides);
}

export async function addTestGroup(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  { space_id }: { space_id: string },
  overrides?: {
    group_name?: string;
    group_description?: string;
    group_image?: string;
    group_color?: string;
    group_order?: number;
  },
) {
  const group_id = crypto.randomUUID();

  return prisma.group.create({
    data: {
      space_id,
      group_id,
      group_name: overrides?.group_name ?? `test-group-${group_id}`,
      group_description: overrides?.group_description ?? 'test description',
      group_image: overrides?.group_image ?? '',
      group_color: overrides?.group_color ?? '#FFFFFF',
      group_order: overrides?.group_order ?? 0,
      created_by: user_id,
      updated_by: user_id,
    },
  });
}
