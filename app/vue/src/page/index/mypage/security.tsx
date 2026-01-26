import { MypageRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { storeToRefs } from 'pinia';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, nextTick, ref, Transition } from 'vue';
import MyButton from '~/component/button/MyButton.tsx';
import MyInput from '~/component/input/MyInput.vue';
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useMypageStore } from '~/store/MypageStore';

export default defineComponent(() => {
  const { mypage } = storeToRefs(useMypageStore());
  const $dialog = useDialog();
  const $toast = useToast();

  const modelValue = ref<z.infer<typeof MypageRouterSchema.enableSecretInput>>({
    token: '',
  });

  const { validate, ErrorMessage, isDirty, revert } = useVueValidateZod(
    MypageRouterSchema.enableSecretInput,
    modelValue,
  );

  const qrcode = ref<RouterOutput['mypage']['generateSecret']>({
    dataurl: '',
  });

  const refInputToken = ref<HTMLInputElement>();

  return () => (
    <div class="flex flex-col gap-6">
      {/* status */}
      <section>
        <div
          class={[
            'flex flex-col gap-4 border-t-2 p-4',
            mypage.value.twofa_enable
              ? 'border-blue-300 bg-blue-50'
              : 'border-yellow-300 bg-yellow-50',
          ]}
          role="alert"
        >
          <div class="flex items-center gap-4">
            <span class="sr-only">Info</span>

            {mypage.value.twofa_enable ? (
              <span class="icon-[wpf--security-checked] h-32 w-32 text-green-400" />
            ) : (
              <span class="icon-[fluent-emoji-flat--light-bulb] h-32 w-32" />
            )}

            <div>
              <h3
                class={[
                  'text-lg font-medium',
                  mypage.value.twofa_enable ? 'text-blue-900' : 'text-yellow-900',
                ]}
              >
                {mypage.value.twofa_enable
                  ? 'Two-factor authentication is enabled.'
                  : 'Two-factor authentication is not enabled.'}
              </h3>

              {mypage.value.twofa_enable ? (
                <button
                  type="button"
                  class="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
                  onClick={async () => {
                    await $dialog.confirm.warn('Do you want to disable two-factor authentication?');

                    const loading = $dialog.loading();
                    try {
                      await trpc.mypage.disableSecret.mutate();
                      mypage.value.twofa_enable = false;
                      $toast.success('Two-factor authentication has been disabled.');
                    } finally {
                      loading.close();
                    }
                  }}
                >
                  <span class="icon-[fluent-emoji-flat--light-bulb] mr-2 -ml-1 h-4 w-4"></span>
                  <span class="capitalize">disable</span>
                </button>
              ) : (
                <button
                  type="button"
                  class="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
                  onClick={async () => {
                    qrcode.value = await trpc.mypage.generateSecret.mutate();
                    nextTick(() => refInputToken.value?.focus());
                  }}
                >
                  <span class="icon-[wpf--security-checked] mr-2 -ml-1 h-4 w-4 text-green-400" />
                  Start two-factor authentication setup
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* enable form */}
      <section class="flex flex-col gap-4">
        <Transition
          enter-from-class="transform opacity-0 translate-y-4"
          enter-active-class="transition ease-out duration-200"
          enter-to-class="transform opacity-100 translate-y-0"
        >
          {qrcode.value.dataurl && (
            <div class="flex flex-col gap-4">
              <div class="flex items-center space-x-2.5">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600">
                  1
                </span>
                <div>
                  <h3 class="leading-tight font-medium">
                    Scan the QR code with the Authenticator app.
                  </h3>
                  <p class="text-sm text-gray-400">
                    Popular authenticator apps include
                    <a
                      href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="cursor-pointer text-blue-500 hover:text-blue-600"
                    >
                      Google Authenticator
                    </a>
                    and
                    <a
                      href="https://play.google.com/store/apps/details?id=com.azure.authenticator"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="cursor-pointer text-blue-500 hover:text-blue-600"
                    >
                      Microsoft Authenticator
                    </a>
                    .
                  </p>
                </div>
              </div>

              <img src={qrcode.value.dataurl} width={128} height={128} decoding="async" />
            </div>
          )}
        </Transition>

        <Transition
          enter-from-class="transform opacity-0 translate-y-4"
          enter-active-class="transition ease-out duration-200 delay-200"
          enter-to-class="transform opacity-100 translate-y-0"
        >
          {qrcode.value.dataurl && (
            <form
              class="flex flex-col gap-4"
              autocomplete="off"
              onSubmit={async (e) => {
                e.preventDefault();
                const result = await validate();
                if (!result.success) return;

                const loading = $dialog.loading();
                try {
                  await trpc.mypage.enableSecret.mutate({
                    ...modelValue.value,
                  });

                  revert();
                  qrcode.value.dataurl = '';
                  mypage.value.twofa_enable = true;

                  $toast.success('Two-factor authentication was enabled successfully.');
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
                  <span class="leading-tight font-medium">Validate your code.</span>
                  <span class="block text-sm text-gray-400">
                    Enter the authcode shown in the Authenticator app.
                  </span>
                </span>
              </label>

              <div>
                <div class="flex items-center gap-2">
                  <MyInput
                    id="token"
                    ref="refInputToken"
                    v-model={modelValue.value.token}
                    type="text"
                    pattern="\d{6}"
                    class="w-24"
                    required
                    maxlength={6}
                  />
                  <span class="text-xs text-gray-400">{modelValue.value.token.length}/6 char</span>
                </div>
                <ErrorMessage class="text-xs text-red-600" field="token"></ErrorMessage>
              </div>

              <section class="flex gap-2">
                <MyButton type="submit" disabled={!isDirty.value} color="green" variant="contained">
                  <span class="capitalize">enable two-factor authentication</span>
                </MyButton>
              </section>
            </form>
          )}
        </Transition>
      </section>
    </div>
  );
});
