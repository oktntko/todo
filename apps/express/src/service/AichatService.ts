import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import OpenAI from 'openai';
import superjson from 'superjson';
import { log } from '~/lib/log4js';
import { PrismaClient } from '~/middleware/prisma';
import { AichatRouterSchema } from '~/schema/AichatRouterSchema';
import { MypageService } from './MypageService';

export const AichatService = {
  listAichat,
  chatAichat,
};

// aichat.list
async function listAichat(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof AichatRouterSchema.listInput>,
) {
  log.trace(reqid, 'listAichat', operator_id, input);

  return prisma.aichat.findMany({
    orderBy: [{ created_at: 'asc' }],
  });
}

// aichat.chat
async function chatAichat(
  reqid: string,
  prisma: PrismaClient,
  operator_id: number,
  input: z.infer<typeof AichatRouterSchema.chatInput>,
) {
  log.trace(reqid, 'createAichat', operator_id, input);

  const openai = await generateOpenai(reqid, prisma, operator_id);

  const prompt = {
    role: 'system',
    content: `あなたはユーザーのメンタルやタスク整理を支援するAIコーチです。
最初はタスクの話に無理に入らず、ユーザーの話をよく聞いて、共感しながら深掘りしてください。
数ターンの会話の中で、必要があれば「気になることを整理しませんか？」と自然に提案してください。
タスク管理の提案は、相手がそれを受け入れそうなタイミングまで控えてください。`,
  } as const;

  const messages = [prompt, ...input.messages.map((x) => x.message), input.message];

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-nano',
    messages,
    tools: [
      {
        type: 'function',
        function: {
          name: 'propose_todo',
          description: 'ユーザー発言からタスク候補を抽出する。まだToDoには確定しない。',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              reason: { type: 'string', description: '雑談からどうタスクと判断したか' },
            },
            required: ['title'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'add_todo',
          description: 'ユーザーの確認を得てToDoを確定登録する',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              due: { type: 'string', nullable: true },
            },
            required: ['title'],
          },
        },
      },
    ],
  });

  if (response.choices.length === 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'API失敗',
    });
  }

  log.trace(reqid, 'chat', response.choices);
  const choice = response.choices[0]!;

  if (choice.finish_reason === 'tool_calls') {
    for (const tool of choice.message.tool_calls!) {
      log.info(tool.id, tool);
    }
  }

  await prisma.aichat.createMany({
    data: [
      { message: superjson.stringify(input.message) },
      { message: superjson.stringify(choice.message) },
    ],
  });

  messages.shift();
  return [
    ...messages.map((x) => ({ message: x })),
    {
      message: {
        role: choice.message.role,
        content: choice.message.content ?? '',
      },
    },
  ];
}

async function generateOpenai(reqid: string, prisma: PrismaClient, operator_id: number) {
  const user = await MypageService.getMypage(reqid, prisma, operator_id);

  return new OpenAI({ apiKey: user.aichat_api_key });
}
