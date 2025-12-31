import { z } from '@todo/lib/zod';
import supertest from 'supertest';
import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackExpress } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter /api/file/download/single`, () => {
  test(`✅ success - download single file.
    - it return input file.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.getInput> = {
        file_id: crypto.randomUUID(),
      };

      await tx.file.createMany({
        data: [
          {
            file_id: input.file_id,
            filename: `${input.file_id}.txt`,
            mimetype: 'text/plain',
            filesize: 1024,
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
        ],
      });

      const output = Buffer.from('test');
      const mockReadFile = vi.spyOn(FileRepository, 'readFile');
      mockReadFile.mockResolvedValueOnce(output);

      // act
      const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

      // assert
      expect(res.statusCode).toBe(200);
      expect(res.header).toMatchObject({
        'content-disposition': `attachment; filename=${input.file_id}.txt`,
      });
      expect(res.body).toEqual(output);
    });
  });

  test(`⚠️ resource state error - file not found in storage.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.getInput> = {
        file_id: crypto.randomUUID(),
      };

      await tx.file.createMany({
        data: [
          {
            file_id: input.file_id,
            filename: `${input.file_id}.txt`,
            mimetype: 'text/plain',
            filesize: 1024,
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
        ],
      });

      // act
      const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

      // assert
      expect(res.statusCode).toBe(404);
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
      const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

      // assert
      expect(res.statusCode).toBe(404);
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
      const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

      // assert
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        code: 'BAD_REQUEST',
        message: message.error.BAD_REQUEST,
      });
    });
  });
});
