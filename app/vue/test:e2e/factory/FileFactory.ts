import { z } from '@todo/lib/zod';
import { FileSchema } from '@todo/prisma/schema';

export const FileFactory = {
  create,
};

function create({
  space_id = crypto.randomUUID(),

  file_id = crypto.randomUUID(),
  filename = `test.txt`,
  mimetype = 'text/plain',
  filesize = 1024,

  created_at = new Date(),
  created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
  updated_at = new Date(),
  updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
}: Partial<z.infer<typeof FileSchema>>): z.infer<typeof FileSchema> {
  return {
    space_id,

    file_id,
    filename,
    mimetype,
    filesize,

    created_at,
    created_by,
    updated_at,
    updated_by,
  };
}
