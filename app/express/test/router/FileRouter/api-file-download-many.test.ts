import { z } from '@todo/lib/zod';
import supertest from 'supertest';
import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackExpress } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter /api/file/download/many`, () => {
  test(`✅ success - download many files as zip file.
    - it return zip file.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.getManyInput> = {
        file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
      };

      await tx.file.createMany({
        data: [
          {
            file_id: input.file_id_list[0],
            filename: `${input.file_id_list[0]}.txt`,
            mimetype: 'text/plain',
            filesize: 1024,
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
          {
            file_id: input.file_id_list[1],
            filename: `${input.file_id_list[1]}.txt`,
            mimetype: 'text/plain',
            filesize: 1024,
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
          {
            file_id: input.file_id_list[2],
            filename: `${input.file_id_list[2]}.txt`,
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
      mockReadFile.mockResolvedValue(output);

      // act
      const res = await supertest(app).get(`/api/file/download/many`).query(input);

      // assert
      expect(res.statusCode).toBe(200);
      expect(res.header).toMatchObject({
        'content-disposition': `attachment; filename=download.zip`,
      });
      expect(res.body).toEqual(expect.anything());

      // after
      mockReadFile.mockRestore();
    });
  });

  test(`⚠️ resource state error - file not found in storage.
    - it throw NOT_FOUND error.`, async () => {
    return transactionRollbackExpress(prisma, async ({ tx, operator }) => {
      // arrange
      const input: z.infer<typeof FileRouterSchema.getManyInput> = {
        file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
      };

      await tx.file.createMany({
        data: [
          {
            file_id: input.file_id_list[0],
            filename: `${input.file_id_list[0]}.txt`,
            mimetype: 'text/plain',
            filesize: 1024,
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
          {
            file_id: input.file_id_list[1],
            filename: `${input.file_id_list[1]}.txt`,
            mimetype: 'text/plain',
            filesize: 1024,
            created_at: new Date(2001, 2, 3),
            updated_at: new Date(2001, 2, 3),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
          {
            file_id: input.file_id_list[2],
            filename: `${input.file_id_list[2]}.txt`,
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
      const res = await supertest(app).get(`/api/file/download/many`).query(input);

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
      const input: z.infer<typeof FileRouterSchema.getManyInput> = {
        file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
      };

      // act
      const res = await supertest(app).get(`/api/file/download/many`).query(input);

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
      const input: z.infer<typeof FileRouterSchema.getManyInput> = {
        file_id_list: ['crypto.randomUUID()', crypto.randomUUID(), crypto.randomUUID()],
      };

      // act
      const res = await supertest(app).get(`/api/file/download/many`).query(input);

      // assert
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        code: 'BAD_REQUEST',
        message: message.error.BAD_REQUEST,
      });
    });
  });
});
