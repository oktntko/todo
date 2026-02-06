import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';

import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`SpaceRouter space.create`, () => {
  test(`✅ success - create a new space.
    - it return the created space.
    - it create the record in the database.
    - it add operator to space_user_list automatically.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const input: z.infer<typeof SpaceRouterSchema.createInput> = {
        space_name: 'test space',
        space_description: 'test description',
        space_image: 'iVBORw0KGgoANeSU',
        space_color: '#FFFFFF',
      };

      // act
      const output = await caller.space.create(input);

      // assert
      expect(output).toEqual({
        ...input,
        space_id: output.space_id,
        created_at: output.created_at,
        updated_at: output.updated_at,
        created_by: operator.user_id,
        updated_by: operator.user_id,
      } satisfies typeof output);

      // Verify the record is saved in the database
      const created = await tx.space.findUniqueOrThrow({
        include: { space_user_list: true },
        where: { space_id: output.space_id },
      });
      expect(created).toMatchObject({
        ...input,
        space_id: output.space_id,
        created_at: output.created_at,
        updated_at: output.updated_at,
        created_by: operator.user_id,
        updated_by: operator.user_id,
        space_user_list: [
          {
            id: expect.any(String),
            role: 'OWNER',
            space_id: created.space_id,
            user_id: operator.user_id,
          },
        ],
      } satisfies typeof created);
    });
  });
});
