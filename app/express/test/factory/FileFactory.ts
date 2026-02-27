import { z } from '@todo/lib/zod';
import { FileSchema } from '@todo/prisma/schema';

import { PrismaClient } from '~/middleware/prisma';

export const FileFactory = {
  create,
};

async function create(
  prisma: PrismaClient,
  {
    file_id = crypto.randomUUID(),
    created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
    updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
    filename = `test.txt`,
    mimetype = 'text/plain',
    filesize = 1024,

    ...overrides
  }: Partial<Omit<z.infer<typeof FileSchema>, 'space_id'>> &
    Pick<z.infer<typeof FileSchema>, 'space_id'>,
) {
  return prisma.file.create({
    data: {
      file_id,
      created_by,
      updated_by,

      filename,
      mimetype,
      filesize,

      ...overrides,
    },
  });
}
