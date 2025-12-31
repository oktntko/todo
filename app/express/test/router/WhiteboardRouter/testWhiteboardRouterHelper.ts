import { PrismaClient } from '~/middleware/prisma';

export async function createWhiteboard(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  overrides?: {
    whiteboard_name?: string;
    whiteboard_description?: string;
    whiteboard_content?: string;
    whiteboard_order?: number;
  },
) {
  const whiteboard_id = Math.floor(Math.random() * 1000000);
  const count = await prisma.whiteboard.count({
    where: { owner_id: user_id },
  });

  return prisma.whiteboard.create({
    data: {
      whiteboard_id,
      whiteboard_name: overrides?.whiteboard_name ?? `test-whiteboard-${whiteboard_id}`,
      whiteboard_description: overrides?.whiteboard_description ?? 'test description',
      whiteboard_content: overrides?.whiteboard_content ?? '{}',
      whiteboard_order: overrides?.whiteboard_order ?? count,
      owner_id: user_id,
      created_by: user_id,
      updated_by: user_id,
    },
  });
}
