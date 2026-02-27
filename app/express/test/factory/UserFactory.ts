import { z } from '@todo/lib/zod';
import { UserSchema } from '@todo/prisma/schema';

import { HashPassword } from '~/lib/secret';
import { PrismaClient } from '~/middleware/prisma';

export const UserFactory = {
  create,
};

async function create(
  prisma: PrismaClient,
  {
    user_id = crypto.randomUUID(),
    email = `${user_id}@example.com`,
    password = HashPassword.hash('test@example.com'),
    username = `${user_id} username`,

    ...overrides
  }: Partial<z.infer<typeof UserSchema>> = {},
) {
  return prisma.user.create({
    data: {
      user_id,
      email,

      password,
      username,

      ...overrides,
    },
  });
}
