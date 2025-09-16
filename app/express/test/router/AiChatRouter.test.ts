import { z } from '@todo/lib/zod';
import { mockopts } from 't/helper/express';
import { transactionRollback } from 't/helper/prisma';
import 't/helper/session';
import { generatePrisma } from '~/middleware/prisma';
import { createContext } from '~/middleware/trpc';
import { createCaller } from '~/router/_router';
import { AichatRouterSchema } from '~/schema/AichatRouterSchema';
import { UserRouterSchema } from '~/schema/UserRouterSchema';

const prisma = generatePrisma('test');

describe.only(`AiChatRouter`, () => {
  describe(`openai.chat`, () => {
    describe(`test search input`, () => {
      test(`user_keyword`, async () => {
        return transactionRollback(prisma, async (prisma) => {
          const ctx = createContext(mockopts(), prisma);
          const caller = createCaller(ctx);

          const messages = await caller.aichat.list({});

          const input: z.infer<typeof AichatRouterSchema.chatInput> = {
            messages,
            message: {
              role: 'user',
              content: '最近ほんと疲れてて、何もやる気が起きないんだよね',
            },
          };

          //
          const output = await caller.aichat.chat(input);

          //
          console.log(output);
          expect(output).toEqual({
            total: 2,
            user_list: [
              {
                user_id: 1,
                username: 'user_keyword',
                email: '1@example.com',
                password: '1',
                twofa_enable: false,
                twofa_secret: '',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
              {
                user_id: 2,
                username: '2',
                email: 'user_keyword@example.com',
                password: '2',
                twofa_enable: false,
                twofa_secret: '',
                created_at: new Date(2001, 2, 3),
                updated_at: new Date(2001, 2, 3),
              },
            ],
          } satisfies z.infer<typeof UserRouterSchema.listOutput>);
        });
      });
    });
  });
});
