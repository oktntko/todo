import type { z } from '@todo/lib/zod';

import { type Prisma } from '@todo/prisma/client';
import { TRPCError } from '@trpc/server';
import { ChatCompletion } from 'openai/resources';

import { newOpenAI } from '~/external/openai';
import { ReqCtx } from '~/lib/context';
import { log } from '~/lib/log4js';
import { SecretPassword } from '~/lib/secret';
import { ProtectedContext } from '~/middleware/trpc';
import { _repository } from '~/repository/_repository';
import { AichatRepository } from '~/repository/AichatRepository';
import { AichatRouterSchema } from '~/schema';
import { SpaceAuthorization, SpaceService } from '~/service/SpaceService';

export const AichatService = {
  listAichat,
  getAichat,
  createAichat,
  updateAichat,
  deleteAichat,
  listAichatMessage,
  postAichatMessage,
};

// aichat.list
async function listAichat(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.listInput>,
) {
  log.trace(ReqCtx.reqid, 'listAichat', ctx.operator.user_id);

  const AND: Prisma.AichatWhereInput[] = [];
  AND.push({ space_id: input.space_id });

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const where: Prisma.AichatWhereInput = {
    ...hasAccessAuthorityWhere,
    AND,
  };

  return AichatRepository.findManyAichat(ctx.prisma, {
    where,
    orderBy: { updated_at: 'desc' },
  });
}

// aichat.get
async function getAichat(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.getInput>,
) {
  log.trace(ReqCtx.reqid, 'getAichat', ctx.operator.user_id, input);

  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  return _repository.checkDataExist({
    data: AichatRepository.findUniqueAichat(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        aichat_id: input.aichat_id,
      },
    }),
  });
}

// aichat.create
async function createAichat(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.createInput>,
) {
  log.trace(ReqCtx.reqid, 'createAichat', ctx.operator.user_id, input);
  // 存在チェック & 認可（読み取り権限）の確認
  const space = await SpaceService.getSpace(ctx, input);

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  return AichatRepository.createAichat(ctx.prisma, {
    operator_id: ctx.operator.user_id,
    data: {
      ...input,
    },
  });
}

// aichat.update
async function updateAichat(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.updateInput>,
) {
  log.trace(ReqCtx.reqid, 'updateAichat', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkVersion({
    current: AichatRepository.findUniqueAichat(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        aichat_id: input.aichat_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  return AichatRepository.updateAichat(ctx.prisma, {
    where: { aichat_id: input.aichat_id },
    operator_id: ctx.operator.user_id,
    data: input,
  });
}

// aichat.delete
async function deleteAichat(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.deleteInput>,
) {
  log.trace(ReqCtx.reqid, 'deleteAichat', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkVersion({
    current: AichatRepository.findUniqueAichat(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        aichat_id: input.aichat_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  await AichatRepository.deleteAichat(ctx.prisma, {
    where: { aichat_id: input.aichat_id },
  });

  return { aichat_id: input.aichat_id };
}

async function listAichatMessage(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.listMessageInput>,
) {
  log.trace(ReqCtx.reqid, 'listAichatMessage', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  await _repository.checkDataExist({
    data: AichatRepository.findUniqueAichat(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        aichat_id: input.aichat_id,
      },
    }),
  });

  return AichatRepository.findUniqueAichatListMessage(ctx.prisma, {
    where: {
      aichat_id: input.aichat_id,
    },
  });
}

async function postAichatMessage(
  ctx: ProtectedContext,
  input: z.infer<typeof AichatRouterSchema.postMessageInput>,
) {
  log.trace(ReqCtx.reqid, 'postAichatMessage', ctx.operator.user_id, input);

  // 存在チェック & 認可（読み取り権限）の確認
  const hasAccessAuthorityWhere = generateHasAccessAuthorityWhere(ctx.operator.user_id);
  const { space } = await _repository.checkVersion({
    current: AichatRepository.findUniqueAichat(ctx.prisma, {
      operator_id: ctx.operator.user_id,
      where: {
        ...hasAccessAuthorityWhere,
        aichat_id: input.aichat_id,
      },
    }),
    updated_at: input.updated_at,
  });

  // 認可（変更権限）の確認
  const user_role = space.space_user_list.find((x) => x.user_id === ctx.operator.user_id)?.role;
  SpaceAuthorization.checkHasAuthority({ need_role: ['OWNER', 'ADMIN', 'EDITOR'], user_role });

  const aichat_api_key = SecretPassword.decrypt(space.aichat_api_key);
  const openai = newOpenAI({ apiKey: aichat_api_key });

  const prompt = {
    role: 'system',
    content: `あなたはユーザーのメンタルやタスク整理を支援するAIコーチです。
最初はタスクの話に無理に入らず、ユーザーの話をよく聞いて、共感しながら深掘りしてください。
数ターンの会話の中で、必要があれば「気になることを整理しませんか？」と自然に提案してください。
タスク管理の提案は、相手がそれを受け入れそうなタイミングまで控えてください。`,
  } as const;

  const { aichat_message_list } = await AichatRepository.findUniqueAichatListMessage(ctx.prisma, {
    where: {
      aichat_id: input.aichat_id,
    },
  });

  const postMessage = {
    role: 'user',
    content: input.content,
    user: {
      username: ctx.operator.username,
      avatar_image: ctx.operator.avatar_image,
    },
  } as const;

  const messages = [...aichat_message_list, postMessage];

  const response = await openai.chat.completions.create({
    model: input.aichat_model,
    messages: [
      prompt,
      ...messages.map((message) => {
        return {
          content: message.content,
          role: message.role,
        };
      }),
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'propose_todo',
          description: 'ユーザ発言からタスク候補を抽出する。まだToDoには確定しない。',
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
          description: 'ユーザの確認を得てToDoを確定登録する',
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
      {
        type: 'function',
        function: {
          name: 'output',
          parameters: {
            type: 'object',
            properties: {
              answer: {
                type: 'string',
                description: 'ユーザへの回答',
              },
              title: {
                type: 'string',
                description: '内容を要約した短いタイトル。100文字以内',
              },
            },
            required: ['answer', 'title'],
          },
        },
      },
    ],
    tool_choice:
      aichat_message_list.length === 0
        ? {
            type: 'function',
            function: { name: 'output' },
          }
        : undefined,
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
  const choice: ChatCompletion.Choice = response.choices[0]!;

  let content = '';
  let aichat_title = undefined;

  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    for (const tool of choice.message.tool_calls!) {
      log.info(tool.id, tool);
      if (tool.type === 'function') {
        if (tool.function.name === 'output') {
          const { answer, title } = JSON.parse(tool.function.arguments);
          content = answer;
          aichat_title = title;
          break;
        }
      }
    }
  } else {
    content = choice.message.content ?? '';
  }

  const result = await AichatRepository.updateAichat(ctx.prisma, {
    operator_id: ctx.operator.user_id,
    where: {
      aichat_id: input.aichat_id,
    },
    data: {
      aichat_title,
      aichat_message_list: {
        createMany: {
          data: [
            {
              role: postMessage.role,
              content: postMessage.content,
              created_by: ctx.operator.user_id,
              updated_by: ctx.operator.user_id,
              user_id: ctx.operator.user_id,
            },
            {
              role: 'assistant',
              content,
              created_by: ctx.operator.user_id,
              updated_by: ctx.operator.user_id,
              user_id: ctx.operator.user_id,
            },
          ],
        },
      },
    },
  });

  return {
    ...result,
    aichat_message_list: [
      ...messages,
      {
        role: choice.message.role,
        content,
        user: {
          username: ctx.operator.username,
          avatar_image: ctx.operator.avatar_image,
        },
      },
    ],
  };
}

// #region Authorization
function generateHasAccessAuthorityWhere(user_id: string) {
  return {
    space: {
      space_user_list: {
        some: {
          user_id,
        },
      },
    },
  } as const satisfies Prisma.AichatWhereInput;
}
// #endregion Authorization
