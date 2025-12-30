import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import supertest from 'supertest';
import { app } from '~/app';
import { message } from '~/lib/message';
import { ExtendsPrismaClient, PrismaClient } from '~/middleware/prisma';
import { FileRepository } from '~/repository/FileRepository';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackExpress, transactionRollbackTrpc } from '../helper';

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

  describe(`/api/file/download/many`, () => {
    test(`success`, async () => {
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
    test(`file not found in storage`, async () => {
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
    test(`file not found in database`, async () => {
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
    test(`input error`, async () => {
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
    test(`system error`, async () => {
      return transactionRollbackExpress(prisma, async () => {
        // arrange
        const input: z.infer<typeof FileRouterSchema.getManyInput> = {
          file_id_list: [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()],
        };

        const mockFindUniqueFile = vi.spyOn(FileRepository, 'findUniqueFile');
        mockFindUniqueFile.mockRejectedValueOnce('test');

        // act
        const res = await supertest(app).get(`/api/file/download/many`).query(input);

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: message.error.INTERNAL_SERVER_ERROR,
        });
      });
    });
  });

  describe(`/api/file/upload/single`, () => {
    test(`success`, async () => {
      return transactionRollbackExpress(prisma, async ({ operator }) => {
        // arrange
        const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
        mockWriteFile.mockResolvedValueOnce();

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/single`)
          .attach('file', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          file_id: expect.anything(),
          filesize: 4,
          filename: 'test.txt',
          mimetype: 'text/plain',
          created_at: expect.anything(),
          updated_at: expect.anything(),
          created_by: operator.user_id,
          updated_by: operator.user_id,
        });
      });
    });
    test(`input error`, async () => {
      return transactionRollbackExpress(prisma, async () => {
        // arrange
        const mockReadFile = vi.spyOn(FileRepository, 'writeFile');
        mockReadFile.mockResolvedValueOnce();

        // act
        const res = await supertest(app).post(`/api/file/upload/single`);

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
        const mockFindCreateFile = vi.spyOn(FileRepository, 'createFile');
        mockFindCreateFile.mockRejectedValueOnce('test');

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/single`)
          .attach('file', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: message.error.INTERNAL_SERVER_ERROR,
        });

        // after
        mockFindCreateFile.mockRestore();
      });
    });
  });

  describe(`/api/file/upload/many`, () => {
    test(`success`, async () => {
      return transactionRollbackExpress(prisma, async ({ operator }) => {
        // arrange
        const mockWriteFile = vi.spyOn(FileRepository, 'writeFile');
        mockWriteFile.mockResolvedValue();

        const output1 = Buffer.from('test1');
        const output2 = Buffer.from('test2');
        const output3 = Buffer.from('test3');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/many`)
          .attach('files', output1, 'test1.txt')
          .attach('files', output2, 'test2.txt')
          .attach('files', output3, 'test3.txt');

        // assert
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([
          {
            file_id: expect.anything(),
            filesize: 5,
            filename: 'test1.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
          {
            file_id: expect.anything(),
            filesize: 5,
            filename: 'test2.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
          {
            file_id: expect.anything(),
            filesize: 5,
            filename: 'test3.txt',
            mimetype: 'text/plain',
            created_at: expect.anything(),
            updated_at: expect.anything(),
            created_by: operator.user_id,
            updated_by: operator.user_id,
          },
        ]);

        // after
        mockWriteFile.mockRestore();
      });
    });
    test(`input error`, async () => {
      return transactionRollbackExpress(prisma, async () => {
        // arrange
        const mockReadFile = vi.spyOn(FileRepository, 'writeFile');
        mockReadFile.mockResolvedValueOnce();

        // act
        const res = await supertest(app).post(`/api/file/upload/many`);

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
        const mockFindCreateFile = vi.spyOn(FileRepository, 'createFile');
        mockFindCreateFile.mockRejectedValueOnce('test');

        const output = Buffer.from('test');

        // act
        const res = await supertest(app)
          .post(`/api/file/upload/many`)
          .attach('files', output, 'test.txt');

        // assert
        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({
          code: 'INTERNAL_SERVER_ERROR',
          message: message.error.INTERNAL_SERVER_ERROR,
        });

        mockFindCreateFile.mockRestore();
      });
    });
  });

  async function createFile(prisma: PrismaClient, { user_id }: { user_id: string }) {
    return prisma.file.create({
      data: {
        file_id: 'c30e3b6c-aaa5-438d-902a-2f816111ab40',
        filename: `test.txt`,
        mimetype: 'text/plain',
        filesize: 1024,
        created_at: new Date(2001, 2, 3),
        updated_at: new Date(2001, 2, 3),
        created_by: user_id,
        updated_by: user_id,
      },
    });
  }

  describe(`file.delete`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file = await createFile(tx, operator);

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            ...file,
          };

          //
          const output = await caller.file.delete(input);

          //
          expect(output).toEqual({ file_id: input.file_id });
        });
      });
      test(`fail. previous is updated.`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const { file_id } = await createFile(tx, operator);

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            file_id,
            updated_at: new Date(2001, 2, 4), // updated
          };

          //
          await expect(caller.file.delete(input)).rejects.toThrow(
            new TRPCError({
              code: 'CONFLICT',
              message: message.error.CONFLICT_PREVIOUS_UPDATED,
            }),
          );
        });
      });
      test(`fail. data is not exist.`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller }) => {
          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            file_id: '82ecb7c5-97db-4bf9-b647-48bb5d56822e', // not found
            updated_at: new Date(2001, 2, 4),
          };

          //
          await expect(caller.file.delete(input)).rejects.toThrow(
            new TRPCError({
              code: 'NOT_FOUND',
              message: message.error.NOT_FOUND,
            }),
          );
        });
      });
    });
    describe(`test data access`, () => {
      test(`FileRepository.deleteFile single`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file = await createFile(tx, operator);

          const input: z.infer<typeof FileRouterSchema.deleteInput> = {
            ...file,
          };

          //
          const output = await caller.file.delete(input);

          //
          expect(output).toEqual({ file_id: input.file_id });
          expect(await tx.file.findUnique({ where: { file_id: output.file_id } })).toBeNull();
        });
      });
    });
  });

  describe(`file.deleteMany`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file = await createFile(tx, operator);

          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [{ ...file }];

          //
          const output = await caller.file.deleteMany(input);

          //
          expect(output).toEqual({ ok: true });
        });
      });
      test(`fail. previous is updated.`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const { file_id } = await createFile(tx, operator);

          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [
            {
              file_id,
              updated_at: new Date(2001, 2, 4), // updated
            },
          ];

          //
          await expect(caller.file.deleteMany(input)).rejects.toThrow(
            new TRPCError({
              code: 'CONFLICT',
              message: message.error.CONFLICT_PREVIOUS_UPDATED,
            }),
          );
        });
      });
      test(`fail. data is not exist.`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller }) => {
          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [
            {
              file_id: '82ecb7c5-97db-4bf9-b647-48bb5d56822e', // not found
              updated_at: new Date(2001, 2, 4),
            },
          ];

          //
          await expect(caller.file.deleteMany(input)).rejects.toThrow(
            new TRPCError({
              code: 'NOT_FOUND',
              message: message.error.NOT_FOUND,
            }),
          );
        });
      });
    });
    describe(`test data access`, () => {
      test(`FileRepository.deleteFile many`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file = await createFile(tx, operator);

          const input: z.infer<typeof FileRouterSchema.deleteInput>[] = [{ ...file }];

          //
          const output = await caller.file.deleteMany(input);

          //
          expect(output).toEqual({ ok: true });
          expect(
            await tx.file.count({ where: { file_id: { in: input.map((x) => x.file_id) } } }),
          ).toBe(0);
        });
      });
    });
  });

  describe(`file.search`, () => {
    describe(`test decision table`, () => {
      test(`success`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file = await createFile(tx, operator);

          // Add user_list relation
          await tx.file.update({
            where: { file_id: file.file_id },
            data: {
              user_list: {
                connect: {
                  user_id: operator.user_id,
                },
              },
            },
          });

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: file.filename,
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 10,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output).toEqual({
            total: expect.any(Number),
            file_list: expect.any(Array),
          });
          expect(output.total).toBeGreaterThan(0);
          expect(output.file_list).toContainEqual(
            expect.objectContaining({ file_id: file.file_id }),
          );
        });
      });
      test(`success with no keyword`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file = await createFile(tx, operator);

          // Add user_list relation
          await tx.file.update({
            where: { file_id: file.file_id },
            data: {
              user_list: {
                connect: {
                  user_id: operator.user_id,
                },
              },
            },
          });

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: '',
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 10,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output).toEqual({
            total: expect.any(Number),
            file_list: expect.any(Array),
          });
          expect(output.total).toBeGreaterThan(0);
        });
      });
      test(`success with pagination`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          // Create multiple files
          const files = await Promise.all([
            tx.file.create({
              data: {
                file_id: crypto.randomUUID(),
                filename: 'test1.txt',
                mimetype: 'text/plain',
                filesize: 1024,
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
                created_by: operator.user_id,
                updated_by: operator.user_id,
              },
            }),
            tx.file.create({
              data: {
                file_id: crypto.randomUUID(),
                filename: 'test2.txt',
                mimetype: 'text/plain',
                filesize: 1024,
                created_at: new Date(2001, 2, 4),
                updated_at: new Date(2001, 2, 4),
                created_by: operator.user_id,
                updated_by: operator.user_id,
              },
            }),
            tx.file.create({
              data: {
                file_id: crypto.randomUUID(),
                filename: 'test3.txt',
                mimetype: 'text/plain',
                filesize: 1024,
                created_at: new Date(2001, 2, 5),
                updated_at: new Date(2001, 2, 5),
                created_by: operator.user_id,
                updated_by: operator.user_id,
              },
            }),
          ]);

          // Add user_list relation for all files
          await Promise.all(
            files.map((file) =>
              tx.file.update({
                where: { file_id: file.file_id },
                data: {
                  user_list: {
                    connect: {
                      user_id: operator.user_id,
                    },
                  },
                },
              }),
            ),
          );

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: '',
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 2,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output.file_list.length).toBeLessThanOrEqual(2);
        });
      });
      test(`fail. no files for user`, async () => {
        return transactionRollbackTrpc(prisma, async ({ caller }) => {
          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: 'not-exist',
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 10,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output).toEqual({
            total: 0,
            file_list: [],
          });
        });
      });
    });
    describe(`test data access`, () => {
      test(`search by filename`, async () => {
        return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
          const file1 = await createFile(tx, operator);
          const file2 = await tx.file.create({
            data: {
              file_id: crypto.randomUUID(),
              filename: 'different-name.txt',
              mimetype: 'text/plain',
              filesize: 1024,
              created_at: new Date(2001, 2, 3),
              updated_at: new Date(2001, 2, 3),
              created_by: operator.user_id,
              updated_by: operator.user_id,
            },
          });

          // Add user_list relation
          await Promise.all([
            tx.file.update({
              where: { file_id: file1.file_id },
              data: {
                user_list: {
                  connect: {
                    user_id: operator.user_id,
                  },
                },
              },
            }),
            tx.file.update({
              where: { file_id: file2.file_id },
              data: {
                user_list: {
                  connect: {
                    user_id: operator.user_id,
                  },
                },
              },
            }),
          ]);

          const input: z.infer<typeof FileRouterSchema.searchInput> = {
            where: {
              file_keyword: 'test',
            },
            sort: {
              field: 'created_at',
              order: 'desc',
            },
            limit: 10,
            page: 1,
          };

          //
          const output = await caller.file.search(input);

          //
          expect(output.file_list.map((f) => f.file_id)).toContain(file1.file_id);
          expect(output.file_list.map((f) => f.file_id)).not.toContain(file2.file_id);
        });
      });
    });
  });
});
