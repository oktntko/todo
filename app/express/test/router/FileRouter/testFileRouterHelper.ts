import { PrismaClient } from '~/middleware/prisma';

export async function createFile(prisma: PrismaClient, { user_id }: { user_id: string }) {
  const file_id = crypto.randomUUID();
  return prisma.file.create({
    data: {
      file_id,
      filename: `test.txt`,
      mimetype: 'text/plain',
      filesize: 1024,
      created_at: new Date(2001, 2, 3),
      updated_at: new Date(2001, 2, 3),
      created_by: user_id,
      updated_by: user_id,
    },
  });
}
