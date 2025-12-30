import { z } from '@todo/lib/zod';
import supertest from 'supertest';
import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackExpress } from '../../helper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter`, () => {
  describe(`/api/file/download/single`, () => {
    test(`success`, async () => {
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
    test(`file not found in storage`, async () => {
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
    test(`file not found in database`, async () => {
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
    test(`input error`, async () => {
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
    test(`system error`, async () => {
      return transactionRollbackExpress(prisma, async () => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getInput> = {
          file_id: crypto.randomUUID(),
        };

        const mockFindUniqueFile = vi.spyOn(FileRepository, 'findUniqueFile');
        mockFindUniqueFile.mockRejectedValueOnce('test');

        // act
        const res = await supertest(app).get(`/api/file/download/single/${input.file_id}`);

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: message.error.INTERNAL_SERVER_ERROR,
        });
      });
    });
  });
});
