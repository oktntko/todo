import { SpaceUserRole } from '@todo/prisma/client';

import { PrismaClient } from '~/middleware/prisma';

import { createTestSpace } from '../SpaceRouter/_SpaceRouterTestHelper';

export async function createTestSpaceAndAddWhiteboard(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  role: SpaceUserRole | undefined,
  overrides?: {
    whiteboard_name?: string;
    whiteboard_description?: string;
    whiteboard_content?: string;
    whiteboard_order?: number;
  },
) {
  const space = await createTestSpace(prisma, { user_id }, role);

  return addTestWhiteboard(prisma, { user_id }, space, overrides);
}

export async function addTestWhiteboard(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  { space_id }: { space_id: string },
  overrides?: {
    whiteboard_name?: string;
    whiteboard_description?: string;
    whiteboard_content?: string;
    whiteboard_order?: number;
  },
) {
  const whiteboard_id = crypto.randomUUID();

  return prisma.whiteboard.create({
    data: {
      space_id,
      whiteboard_id,
      whiteboard_name: overrides?.whiteboard_name ?? `test-whiteboard-${whiteboard_id}`,
      whiteboard_description: overrides?.whiteboard_description ?? 'test description',
      whiteboard_content: overrides?.whiteboard_content ?? '{}',
      whiteboard_order: overrides?.whiteboard_order ?? 0,
      created_by: user_id,
      updated_by: user_id,
    },
  });
}
