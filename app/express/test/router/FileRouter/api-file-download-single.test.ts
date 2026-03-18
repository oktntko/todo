import { z } from '@todo/lib/zod';
import supertest from 'supertest';

import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

import { FileFactory } from '../../factory/FileFactory';
import { SpaceFactory } from '../../factory/SpaceFactory';
import { transactionRollbackExpress } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter /api/file/download/single`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
    { role: 'READER' }, //
  ] as const)(
    `✅ success - download single file, when operator has $role role.
    - it return input file.`,
    async ({ role }) => {
      return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
        // arrange
        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });
        const file = await FileFactory.create(tx, { space_id });

        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: file.file_id,
        };

        const output = Buffer.from('test');
        const mockReadFile = vi.spyOn(FileRepository, 'readFile');
        mockReadFile.mockResolvedValueOnce(output);

        // act
        const res = await supertest(app)
          .get(`/api/file/download/single/${input.file_id}`)
          .expect(200);

        // assert
        expect(res.header).toMatchObject({
          'content-disposition': `attachment; filename=${file.filename}`,
        });
        expect(res.body).toEqual(output);
      });
    },
  );

  test(`⚠️ resource state error - file not found in storage.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx, {
        user_id: operator.user_id,
        role: 'OWNER',
      });

      const file = await FileFactory.create(tx, { space_id });

      const input: z.infer<typeof FileRouterSchema.getInput> = {
        file_id: file.file_id,
      };

      // act
      const res = await supertest(app)
        .get(`/api/file/download/single/${input.file_id}`)
        .expect(404);

      // assert
      expect(res.body).toEqual({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    });
  });

  test(`⚠️ unauthorized error - operator has no authorization to the data.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx }) => {
      // arrange
      const { space_id } = await SpaceFactory.create(tx);

      const file = await FileFactory.create(tx, { space_id });

      const input: z.infer<typeof FileRouterSchema.getInput> = {
        file_id: file.file_id,
      };

      // act
      const res = await supertest(app)
        .get(`/api/file/download/single/${input.file_id}`)
        .expect(404);

      // assert
      expect(res.body).toEqual({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    });
  });

  test(`⚠️ resource state error - file not found in database.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackExpress(prisma, async () => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.getInput> = {
        file_id: crypto.randomUUID(),
      };

      // act
      const res = await supertest(app)
        .get(`/api/file/download/single/${input.file_id}`)
        .expect(404);

      // assert
      expect(res.body).toEqual({
        code: 'NOT_FOUND',
        message: message.error.NOT_FOUND,
      });
    });
  });

  test(`⚠️ validation error - input incorrect data.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackExpress(prisma, async () => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.getInput> = {
        file_id: 'crypto.randomUUID()',
      };

      // act
      const res = await supertest(app)
        .get(`/api/file/download/single/${input.file_id}`)
        .expect(400);

      // assert
      expect(res.body).toEqual({
        code: 'BAD_REQUEST',
        message: message.error.BAD_REQUEST,
      });
    });
  });
});
