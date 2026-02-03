import { SpaceUserRole } from '@todo/prisma/client';

import { PrismaClient } from '~/middleware/prisma';

import { createTestSpace } from '../SpaceRouter/_SpaceRouterTestHelper';

export async function createTestSpaceAndAddFile(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  role: SpaceUserRole | undefined,
  overrides?: {
    filename?: string;
    mimetype?: string;
    filesize?: number;
  },
) {
  const space = await createTestSpace(prisma, { user_id }, role);

  return addTestFile(prisma, { user_id }, space, overrides);
}

export async function addTestFile(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  { space_id }: { space_id: string },
  overrides?: {
    filename?: string;
    mimetype?: string;
    filesize?: number;
  },
) {
  const file_id = crypto.randomUUID();

  return prisma.file.create({
    data: {
      space_id,
      file_id,
      filename: overrides?.filename ?? `test.txt`,
      mimetype: overrides?.mimetype ?? 'text/plain',
      filesize: overrides?.filesize ?? 1024,
      created_by: user_id,
      updated_by: user_id,
    },
  });
}
