import { MypageRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { storeToRefs } from 'pinia';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, ref, Transition } from 'vue';
import MyButton from '~/component/button/MyButton.tsx';
import MyInput from '~/component/input/MyInput.vue';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useMypageStore } from '~/store/MypageStore';

export default defineComponent(() => {
  const { mypage } = storeToRefs(useMypageStore());
  const $dialog = useDialog();
  const $toast = useToast();

  const modelValue = ref<z.infer<typeof MypageRouterSchema.enableAichatInput>>({
    aichat_api_key: '',
  });

  const { validate, ErrorMessage, isDirty, revert } = useVueValidateZod(
    MypageRouterSchema.enableAichatInput,
    modelValue,
  );

  const open = ref<boolean>(false);

  return () => (
    <div class="flex flex-col gap-6">
      <section>
        <div
          class={[
            'flex flex-col gap-4 border-t-2 p-4',
            mypage.value.aichat_enable
              ? 'border-blue-300 bg-blue-50'
              : 'border-yellow-300 bg-yellow-50',
          ]}
          role="alert"
        >
          <div class="flex items-center gap-4">
            <span class="sr-only">Info</span>
            <span
              class={[
                'icon-[fluent-color--chat-more-16] h-32 w-32',
                mypage.value.aichat_enable ? 'text-blue-900' : 'text-yellow-900',
              ]}
            ></span>

            <div>
              <h3
                class={[
                  'text-lg font-medium',
                  mypage.value.aichat_enable ? 'text-blue-900' : 'text-yellow-900',
                ]}
              >
                {mypage.value.aichat_enable ? 'AI Chat is enabled.' : 'AI Chat is not enabled.'}
              </h3>
              {mypage.value.aichat_enable ? (
                <button
                  type="button"
                  class="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
                  onClick={async () => {
                    await $dialog.confirm.warn('Do you want to disable AI Chat?');

                    const loading = $dialog.loading();
                    try {
                      await trpc.mypage.disableAichat.mutate();
                      mypage.value.aichat_enable = false;

                      $toast.success('AI Chat has been disabled.');
                    } finally {
                      loading.close();
                    }
                  }}
                >
                  <span class="capitalize">disable</span>
                </button>
              ) : (
                <button
                  type="button"
                  class="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => {
                    open.value = true;
                  }}
                >
                  Enter AI Chat API Key
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 有効化フォーム */}

      <section class="flex flex-col gap-4">
        <Transition
          enter-from-class="transform opacity-0 translate-y-4 translate-y-0"
          enter-active-class="transition ease-out duration-200"
          enter-to-class="transform opacity-100 translate-y-0 "
        >
          {open.value && (
            <div class="flex flex-col gap-4">
              <div class="flex items-center space-x-2.5">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600">
                  1
                </span>
                <div>
                  <h3 class="leading-tight font-medium">
                    Create new secret key in
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="cursor-pointer text-blue-500 hover:text-blue-600"
                    >
                      OpenAI
                    </a>
                    .
                  </h3>
                </div>
              </div>
            </div>
          )}
        </Transition>

        <Transition
          enter-from-class="transform opacity-0 translate-y-4 translate-y-0"
          enter-active-class="transition ease-out duration-200 delay-200"
          enter-to-class="transform opacity-100 translate-y-0 "
        >
          {open.value && (
            <form
              class="flex flex-col gap-4"
              autocomplete="off"
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await validate();
                if (!result.success) return;

                const loading = $dialog.loading();
                try {
                  await trpc.mypage.enableAichat.mutate({
                    ...modelValue.value,
                  });

                  revert();
                  open.value = false;
                  mypage.value.aichat_enable = true;

                  $toast.success('AI Chat was enabled successfully. ');
                } finally {
                  loading.close();
                }
              }}
            >
              <label for="token" class="flex items-center space-x-2.5">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600">
                  2
                </span>
                <span>
                  <span class="leading-tight font-medium">Copy-paste the secret key.</span>
                </span>
              </label>

              <div>
                <div class="flex items-center gap-2">
                  <MyInput
                    id="aichat_api_key"
                    v-model={modelValue.value.aichat_api_key}
                    type="text"
                    class="w-full"
                    required
                    maxlength="255"
                  />
                </div>
                <ErrorMessage class="text-xs text-red-600" field="aichat_api_key"></ErrorMessage>
              </div>

              <section class="flex gap-2">
                <MyButton type="submit" disabled={!isDirty.value} color="green" variant="contained">
                  <span class="capitalize">enable AI chat</span>
                </MyButton>
              </section>
            </form>
          )}
        </Transition>
      </section>
    </div>
  );
});
