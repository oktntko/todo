import { AuthRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, ref } from 'vue';
import MyButton from '~/component/button/MyButton.tsx';
import MyInput from '~/component/input/MyInput.vue';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';

export default defineComponent(
  (_, { emit: $emit }) => {
    const $dialog = useDialog();

    const modelValue = ref<z.infer<typeof AuthRouterSchema.signinTwofaInput>>({
      token: '',
    });

    const { validate, ErrorMessage, isDirty } = useVueValidateZod(
      AuthRouterSchema.signinTwofaInput,
      modelValue,
    );

    return () => (
      <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
        <form
          class="flex flex-col gap-6"
          autocomplete="off"
          onSubmit={async (e) => {
            e.preventDefault();
            const result = await validate();
            if (!result.success) return;

            const loading = $dialog.loading();
            try {
              const result = await trpc.auth.signinTwofa.mutate(modelValue.value);

              $emit('success', result);
            } finally {
              loading.close();
            }
          }}
        >
          <section class="flex flex-col gap-3">
            <div class="focus-container flex flex-col gap-0.5">
              <div>
                <label for="token" class="text-sm capitalize">
                  authcode
                </label>
              </div>

              <p class="text-sm text-gray-400">
                Enter the authcode shown in the Authenticator app.
              </p>

              <div>
                <MyInput
                  id="token"
                  v-model={modelValue.value.token}
                  type="text"
                  pattern="\d{6}"
                  class="w-full"
                  required
                  maxlength="6"
                />
              </div>

              <ErrorMessage class="text-xs text-red-600" field="token"></ErrorMessage>
            </div>
          </section>

          <section class="flex gap-2">
            <MyButton
              type="submit"
              disabled={!isDirty.value}
              color="green"
              variant="contained"
              class="w-full"
            >
              <span class="capitalize">authentication</span>
            </MyButton>
          </section>
        </form>
      </div>
    );
  },
  {
    emits: {
      success: (_: RouterOutput['auth']['signinTwofa']) => true,
    },
  },
);
