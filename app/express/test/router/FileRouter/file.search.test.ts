import { z } from '@todo/lib/zod';
import { ExtendsPrismaClient } from '~/middleware/prisma';
import { FileRouterSchema } from '~/schema/FileRouterSchema';
import { transactionRollbackTrpc } from '../../helper';
import { createFile } from './testFileRouterHelper';

const prisma = ExtendsPrismaClient;

describe(`FileRouter file.search`, () => {
  test(`filter by login user.`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const other = await tx.user.create({
        data: {
          user_id: '019b7403-f2c4-73ee-92c7-045f7a9b842e',
          username: 'other.user',
          email: 'other.user@example.com',
          password: 'password.other.user@example.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      /* fileNoUser */ await createFile(tx, operator);
      const fileOtherUser = await createFile(tx, operator);
      const fileOperator = await createFile(tx, operator);

      await tx.file.update({
        where: { file_id: fileOtherUser.file_id },
        data: { user_list: { connect: { user_id: other.user_id } } },
      });

      await tx.file.update({
        where: { file_id: fileOperator.file_id },
        data: { user_list: { connect: { user_id: operator.user_id } } },
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

      // act
      const output = await caller.file.search(input);

      // assert
      expect(output.total).toBe(1);
      expect(output.file_list).toContainEqual(
        expect.objectContaining({ file_id: fileOperator.file_id }),
      );
    });
  });

  describe(`search by where condition.`, () => {
    test(`search by filename`, async () => {
      return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
        // arrange
        const file1 = await createFile(tx, operator);
        const file2 = await createFile(tx, operator);
        const file3 = await createFile(tx, operator);

        // update. add user_list relation and different filenames
        await Promise.all([
          tx.file.update({
            where: { file_id: file1.file_id },
            data: {
              filename: 'test-file.txt',
              user_list: { connect: { user_id: operator.user_id } },
            },
          }),
          tx.file.update({
            where: { file_id: file2.file_id },
            data: {
              filename: 'another-name.txt',
              user_list: { connect: { user_id: operator.user_id } },
            },
          }),
          tx.file.update({
            where: { file_id: file3.file_id },
            data: {
              filename: 'sample-file.txt',
              user_list: { connect: { user_id: operator.user_id } },
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

        // act
        const output = await caller.file.search(input);

        // assert
        expect(output.total).toBe(1);
        expect(output.file_list).toContainEqual(
          expect.objectContaining({ file_id: file1.file_id }),
        );
      });
    });
  });

  test(`pagination`, async () => {
    return transactionRollbackTrpc(prisma, async ({ tx, caller, operator }) => {
      // arrange
      const file1 = await createFile(tx, operator);
      const file2 = await createFile(tx, operator);
      const file3 = await createFile(tx, operator);

      // update. add user_list relation and different filenames
      await Promise.all([
        tx.file.update({
          where: { file_id: file1.file_id },
          data: {
            filename: 'test-file.txt',
            user_list: { connect: { user_id: operator.user_id } },
          },
        }),
        tx.file.update({
          where: { file_id: file2.file_id },
          data: {
            filename: 'another-name.txt',
            user_list: { connect: { user_id: operator.user_id } },
          },
        }),
        tx.file.update({
          where: { file_id: file3.file_id },
          data: {
            filename: 'sample-file.txt',
            user_list: { connect: { user_id: operator.user_id } },
          },
        }),
      ]);

      const input: z.infer<typeof FileRouterSchema.searchInput> = {
        where: {
          file_keyword: '',
        },
        sort: {
          field: 'created_at',
          order: 'asc',
        },
        limit: 3,
        page: 1,
      };

      // act
      const output = await caller.file.search(input);

      // assert
      expect(output.total).toBe(3);
      expect(output.file_list).toContainEqual(expect.objectContaining({ file_id: file3.file_id }));
    });
  });
});
