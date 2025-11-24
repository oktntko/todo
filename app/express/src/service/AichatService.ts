import { z } from '@todo/lib/zod';
import { TRPCError } from '@trpc/server';
import OpenAI from 'openai';
import superjson from 'superjson';
import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { SecretPassword } from '~/lib/secret';
import { ProtectedContext } from '~/middleware/trpc';
import { AichatRouterSchema } from '~/schema/AichatRouterSchema';

export const AichatService = {
  listAichat,
  chatAichat,
};

// aichat.list
async function listAichat(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.listInput>,
) {
  log.trace(ReqCtx.reqid, 'listAichat', ctx.operator.user_id, input);

  return ctx.prisma.aichat.findMany({
    orderBy: [{ created_at: 'asc' }],
  });
}

// aichat.chat
async function chatAichat(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.chatInput>,
) {
  log.trace(ReqCtx.reqid, 'createAichat', ctx.operator.user_id, input);

  const aichat_api_key = SecretPassword.decrypt(ctx.operator.aichat_api_key);
  const openai = new OpenAI({ apiKey: aichat_api_key });

  const prompt = {
    role: 'system',
    content: `あなたはユーザーのメンタルやタスク整理を支援するAIコーチです。
最初はタスクの話に無理に入らず、ユーザーの話をよく聞いて、共感しながら深掘りしてください。
数ターンの会話の中で、必要があれば「気になることを整理しませんか？」と自然に提案してください。
タスク管理の提案は、相手がそれを受け入れそうなタイミングまで控えてください。`,
  } as const;

  const messages = [prompt, ...input.messages.map((x) => x.message), input.message];

  const response = await openai.chat.completions.create({
    model: ctx.operator.aichat_model,
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
    // 空配列になるのは、 API 側の障害・内部エラー・タイムアウト後の異常レスポンス などが起きている場合。
    // 正常時は必ず 1 個以上の choice が返る。
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'The service is temporarily unavailable. Please try again in a moment.',
    });
  }

  log.trace(ReqCtx.reqid, 'chat', response.choices);
  const choice = response.choices[0]!;

  if (choice.finish_reason === 'tool_calls') {
    for (const tool of choice.message.tool_calls!) {
      log.info(tool.id, tool);
    }
  }

  await ctx.prisma.aichat.createMany({
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
