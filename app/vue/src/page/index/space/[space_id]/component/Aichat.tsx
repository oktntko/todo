import type { z } from '@todo/lib/zod';

import { AichatRouterSchema } from '@todo/express/schema';
import { R } from '@todo/lib/remeda';
import { AichatModelList, AichatModelSchema } from '@todo/prisma/schema';
import { useVModel } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';

import MyButton from '~/component/button/MyButton';
import MySelect from '~/component/input/MySelect.vue';
import MyTextarea from '~/component/input/MyTextarea.vue';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { satisfiesKeys, type EmitsType } from '~/lib/vue.ts';
import { useDialog } from '~/plugin/DialogPlugin';
import { useMypageStore } from '~/store/MypageStore';

import { useCurrentSpace } from '../../[space_id]';

type Props = {
  modelValue: RouterOutput['aichat']['list'][number];
};
const props = satisfiesKeys<Props>()('modelValue');

const emits = {
  'update:modelValue': (_: RouterOutput['aichat']['list'][number]) => true,
} satisfies EmitsType;

export default defineComponent(
  ($props: Props, { emit: $emit }) => {
    const $dialog = useDialog();

    const { mypage } = storeToRefs(useMypageStore());
    const currentSpace = useCurrentSpace();

    const currentAichat = useVModel($props, 'modelValue', $emit);
    const aichat_message_list = ref<RouterOutput['aichat']['listMessage']['aichat_message_list']>(
      [],
    );

    const loading = ref(true);
    const isPosting = ref(false);
    const messageListContainer = useTemplateRef<HTMLDivElement>('messageListContainer');

    async function scrollToBottom() {
      await nextTick();
      if (messageListContainer.value) {
        messageListContainer.value.scrollTop = messageListContainer.value.scrollHeight;
      }
    }

    async function listMessage() {
      loading.value = true;
      try {
        const aichat = await trpc.aichat.listMessage.query({
          aichat_id: currentAichat.value.aichat_id,
        });

        currentAichat.value = R.omit(aichat, ['aichat_message_list']);
        aichat_message_list.value = aichat.aichat_message_list;

        await scrollToBottom();
      } finally {
        loading.value = false;
      }
    }

    onMounted(async () => {
      await listMessage();
    });

    const formValue = ref<z.infer<typeof AichatRouterSchema.PostMessage>>({
      aichat_model: AichatModelSchema.enum['gpt-4.1-mini'],
      content: '',
    });

    const { validate, ErrorMessage, reset } = useVueValidateZod(
      AichatRouterSchema.PostMessage,
      formValue,
    );

    async function handleSubmit() {
      if (!currentSpace.value.aichat_enable) {
        return $dialog.alert.info(
          'AI Chat is not enabled in this space. Setup AI Chat in space settings to use this feature.',
        );
      }

      const result = await validate();
      if (!result.success) return;

      const value = result.data;

      isPosting.value = true;
      try {
        aichat_message_list.value.push({
          content: value.content,
          role: 'user',
          user: {
            username: mypage.value.username,
            avatar_image: mypage.value.avatar_image,
          },
        });

        reset({
          content: '',
          aichat_model: formValue.value.aichat_model,
        });

        const aichat = await trpc.aichat.postMessage.mutate({
          aichat_id: currentAichat.value.aichat_id,
          updated_at: currentAichat.value.updated_at,
          ...value,
        });

        currentAichat.value = R.omit(aichat, ['aichat_message_list']);
        aichat_message_list.value = aichat.aichat_message_list;
      } catch (e) {
        aichat_message_list.value.pop();
        reset({
          content: value.content,
          aichat_model: formValue.value.aichat_model,
        });
        throw e;
      } finally {
        isPosting.value = false;
      }
    }

    // Watch for new messages to scroll down
    watch(
      () => aichat_message_list.value.length,
      () => {
        void scrollToBottom();
      },
    );

    return () => (
      <div class="flex flex-col gap-8">
        {/* Message List */}
        <div class="flex grow flex-col gap-2">
          {loading.value ? (
            <div class="flex grow items-center justify-center gap-4">
              <span class="icon-[eos-icons--bubble-loading] text-opacity-60 h-16 w-16 text-gray-600" />
            </div>
          ) : aichat_message_list.value.length === 0 ? (
            <div class="flex grow items-end justify-center gap-4 text-2xl text-gray-600">
              Where should we start?
            </div>
          ) : (
            <>
              {aichat_message_list.value.map((message, i) => (
                <div
                  key={i}
                  class={[
                    'flex flex-col gap-1',
                    message.role === 'user' ? 'items-end' : 'items-start',
                  ]}
                >
                  <div
                    class={[
                      'wrap-break-words leading-relaxed whitespace-pre-wrap',
                      'max-w-10/12 px-4 py-2.5 text-sm transition-all',
                      message.role === 'user'
                        ? 'rounded-2xl rounded-tr-none border border-gray-200 bg-white text-gray-800 shadow-xs'
                        : '',
                    ]}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div class="flex flex-row items-center gap-1 px-1 text-[10px] text-gray-400">
                      {message.user?.avatar_image ? (
                        <img
                          src={message.user.avatar_image}
                          width="16"
                          height="16"
                          decoding="async"
                          class="h-4 w-5 rounded-sm object-cover object-center"
                        />
                      ) : (
                        <span class="icon-[ri--image-circle-fill] h-4 w-4"></span>
                      )}
                      <span> {message.user?.username || 'No User'}</span>
                    </div>
                  )}
                </div>
              ))}
              {isPosting.value && (
                <div class="flex animate-pulse flex-col items-start">
                  <div class="rounded-2xl rounded-tl-none border border-gray-200 bg-white px-4 py-3 shadow-xs">
                    <span class="icon-[eos-icons--bubble-loading] h-4 w-4 text-blue-500/60"></span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div class="sticky bottom-0 shrink-0 bg-[linear-gradient(to_bottom,transparent,var(--color-gray-100)_10px,var(--color-gray-100)_10px)] pb-4">
          <form
            autocomplete="off"
            onSubmit={async (e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            class="flex flex-col gap-2"
          >
            <div class="flex flex-col">
              <MyTextarea
                v-model={formValue.value.content}
                placeholder="Type a message..."
                disabled={loading.value || isPosting.value}
                style={{
                  resize: 'none',
                  maxHeight: '20rem',
                  height: '60px',
                }}
                onKeydown={(e: KeyboardEvent) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                onInput={(e: InputEvent) => {
                  const el = e.target as HTMLTextAreaElement | null;
                  if (el == null) {
                    return el;
                  }
                  el.style.height = 'auto';
                  el.style.height = el.scrollHeight + 'px';
                }}
              />
              <ErrorMessage class="text-xs text-red-600" field="content"></ErrorMessage>
            </div>

            <div class="flex gap-2">
              <MyButton
                type="submit"
                color="green"
                variant="contained"
                disabled={
                  loading.value ||
                  isPosting.value ||
                  !(formValue.value.aichat_model && formValue.value.content)
                }
                class="min-w-24 shadow-sm"
              >
                {isPosting.value ? (
                  <span class="icon-[eos-icons--bubble-loading] mr-1 h-3 w-3"></span>
                ) : null}
                Send
              </MyButton>

              <MySelect v-model={formValue.value.aichat_model}>
                {AichatModelList.map((aichat_model) => (
                  <option
                    key={aichat_model}
                    value={aichat_model}
                    class={[
                      'border border-gray-300 p-2 transition-colors',
                      'not-first-of-type:border-t-0 not-last-of-type:border-b-0 first-of-type:rounded-t-lg last-of-type:rounded-b-lg',
                      'hover:bg-gray-100',
                      'checked:bg-blue-100 checked:font-bold',
                    ]}
                  >
                    <div class="flex items-center text-sm text-gray-900">
                      <span>{aichat_model}</span>
                    </div>
                  </option>
                ))}
              </MySelect>
            </div>
          </form>
        </div>
      </div>
    );
  },
  {
    props,
    emits,
  },
);
