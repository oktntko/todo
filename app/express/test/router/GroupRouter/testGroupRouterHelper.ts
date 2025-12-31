import { PrismaClient } from '~/middleware/prisma';

export async function createGroup(
  prisma: PrismaClient,
  { user_id }: { user_id: string },
  overrides?: {
    group_name?: string;
    group_description?: string;
    group_image?: string;
    group_color?: string;
    group_order?: number;
  },
) {
  const group_id = Math.floor(Math.random() * 1000000);
  const count = await prisma.group.count({
    where: { owner_id: user_id },
  });

  return prisma.group.create({
    data: {
      group_id,
      group_name: overrides?.group_name ?? `test-group-${group_id}`,
      group_description: overrides?.group_description ?? 'test description',
      group_image: overrides?.group_image ?? '',
      group_color: overrides?.group_color ?? '#FFFFFF',
      group_order: overrides?.group_order ?? count,
      owner_id: user_id,
      created_by: user_id,
      updated_by: user_id,
    },
  });
}
