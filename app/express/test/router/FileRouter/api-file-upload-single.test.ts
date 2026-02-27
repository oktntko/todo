import { z } from '@todo/lib/zod';
import supertest from 'supertest';

import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema';
import { FileService } from '~/service/FileService';

import { SpaceFactory } from '../../factory/SpaceFactory';
import { transactionRollbackExpress } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter /api/file/upload/single`, () => {
  test.for([
    { role: 'OWNER' }, //
    { role: 'ADMIN' }, //
    { role: 'EDITOR' }, //
  ] as const)(
    `✅ success - upload single file, when operator has $role role.
    - it return the created value.
    - it create the record in the database.`,
    async ({ role }) => {
      return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
        // arrange
        const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
        mockWriteFile.mockResolvedValueOnce();

        const { space_id } = await SpaceFactory.create(tx, {
          user_id: operator.user_id,
          role,
        });

        const input: z.infer<typeof FileRouterSchema.createInputBody> = {
          space_id,
        };

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/single`)
          .attach('file', output, 'test.txt')
          .field('space_id', input.space_id)
          .expect(200);

        // assert
        const expectedValue = {
          file_id: expect.anything(),
          space_id: input.space_id,
          filesize: 4,
          filename: 'test.txt',
          mimetype: 'text/plain',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          created_by: operator.user_id,
          updated_by: operator.user_id,
        } satisfies Awaited<ReturnType<typeof FileService.createFile>>;
        expect(res.body).toEqual(expectedValue);

        const created = await tx.file.findMany({
          where: { space_id: input.space_id },
          orderBy: { filename: 'asc' },
        });
        expect(created).toMatchObject([expectedValue]);

        // after
        mockWriteFile.mockRestore();
      });
    },
  );

  // TODO テストパターンを追加する

  test(`⚠️ validation error - input incorrect data.
    - it throw BAD_REQUEST error.`, async () => {
    return transactionRollbackExpress(prisma, async () => {
      // arrange
      const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
      mockWriteFile.mockResolvedValueOnce();

      // act
      const res = await supertest(app).post(`/api/file/upload/single`).expect(400);

      // assert
      expect(res.body).toEqual({
        code: 'BAD_REQUEST',
        message: message.error.BAD_REQUEST,
      });

      // after
      mockWriteFile.mockRestore();
    });
  });
});
