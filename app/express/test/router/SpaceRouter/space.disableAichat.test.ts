import { z } from '@todo/lib/zod';

import { ExtendsPrismaClient } from '~/middleware/prisma';
import { SpaceRouterSchema } from '~/schema';

import { SpaceFactory } from '../../factory/SpaceFactory';
import { transactionRollbackTrpc } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`SpaceRouter space.disableAichat`, () => {
  test(`✅ success - disable aichat.
    - it return the updated value.
    - it update the record in the database.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const space = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
        aichat_enable: true,
        aichat_api_key: 'valid-key',
      });

      const input: z.infer<typeof SpaceRouterSchema.deleteInput> = {
        space_id: space.space_id,
        updated_at: space.updated_at,
      };

      // act
      const output = await caller.space.disableAichat(input);

      // assert
      expect(output).toMatchObject({
        aichat_enable: false,
      });

      const updated = await tx.space.findUniqueOrThrow({
        where: { space_id: space.space_id },
      });
      expect(updated).toMatchObject({
        ...space,
        aichat_enable: false,
        aichat_api_key: '',
        updated_by: operator.user_id,
        updated_at: expect.any(Date),
      });
    });
  });
});
