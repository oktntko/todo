import { z } from '@todo/lib/zod';
import { GroupSchema } from '@todo/prisma/schema';

export const GroupFactory = {
  create,
};

function create({
  space_id = crypto.randomUUID(),

  group_id = crypto.randomUUID(),
  group_name = `test-group-${group_id}`,
  group_description = `description-${group_id}`,
  group_order = 1,
  group_image = 'https://dummyimage.com/100x100',
  group_color = '#123456',

  created_at = new Date(),
  created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
  updated_at = new Date(),
  updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
}: Partial<z.infer<typeof GroupSchema>>): z.infer<typeof GroupSchema> {
  return {
    space_id,

    group_id,
    group_name,
    group_description,
    group_order,
    group_image,
    group_color,

    created_at,
    created_by,
    updated_at,
    updated_by,
  };
}
