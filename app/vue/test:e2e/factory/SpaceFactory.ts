import { z } from '@todo/lib/zod';
import { SpaceSchema } from '@todo/prisma/schema';

export const SpaceFactory = {
  create,
};

function create({
  space_id = crypto.randomUUID(),
  space_name = `test-space-${space_id}`,
  space_description = `description-${space_id}`,
  space_image = 'https://dummyimage.com/100x100',
  space_color = '#123456',

  created_at = new Date(),
  created_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
  updated_at = new Date(),
  updated_by = '019c85ac-6556-7487-9225-6fa9f34c17bb',
}: Partial<z.infer<typeof SpaceSchema>>): z.infer<typeof SpaceSchema> {
  return {
    space_id,
    space_name,
    space_description,
    space_image,
    space_color,
    aichat_api_key: '',
    aichat_enable: false,

    created_at,
    created_by,
    updated_at,
    updated_by,
  };
}
