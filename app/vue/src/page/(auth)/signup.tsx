import type { z } from '@todo/lib/zod';

import { AuthRouterSchema } from '@todo/express/schema';
import { useTitle } from '@vueuse/core';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import MyButton from '~/component/button/MyButton.tsx';
import MyInput from '~/component/input/MyInput.vue';
import MyInputPassword from '~/component/input/MyInputPassword.vue';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';

export default defineComponent(() => {
  useTitle('Signup | MyTodo');

  const $router = useRouter();
  const $dialog = useDialog();

  const modelValue = ref<z.infer<typeof AuthRouterSchema.signupInput>>({
    email: 'example@example.com',
    new_password: '',
    confirm: '',
  });

  const { validate, ErrorMessage } = useVueValidateZod(AuthRouterSchema.signupInput, modelValue);

  return () => (
    <div class="bg-gray-50">
      <div class="mx-auto flex h-screen flex-col items-center justify-center px-6 py-8 lg:py-0">
        {/* タイトル */}
        <h1 class="mx-auto mb-6 flex items-center gap-1 text-2xl font-semibold">
          <span class="icon-[flat-color-icons--todo-list] -ml-4 h-8 w-8 p-2"></span>
          <span class="">MyTodo</span>
        </h1>

        {/* ボックス */}
        <div class="w-full rounded-lg border border-gray-200 bg-gray-100 p-6 shadow-md sm:max-w-md sm:p-8 md:mt-0">
          <form
            class="flex flex-col gap-6"
            onSubmit={async (e) => {
              e.preventDefault();
              const result = await validate();
              if (!result.success) return;

              const loading = $dialog.loading();
              try {
                await trpc.auth.signup.mutate(modelValue.value);
                return $router.push({ name: '//space/' });
              } finally {
                loading.close();
              }
            }}
          >
            <section class="flex flex-col gap-3">
              <div class="focus-container flex flex-col gap-0.5">
                <div>
                  <label for="email" class="text-sm font-medium text-gray-900 capitalize">
                    email address
                  </label>
                </div>

                <div>
                  <MyInput
                    id="email"
                    v-model={modelValue.value.email}
                    type="email"
                    required
                    class="w-full"
                    autocomplete="username"
                  />
                </div>

                <ErrorMessage class="text-xs text-red-600" field="email"></ErrorMessage>
              </div>

              <div class="focus-container flex flex-col gap-0.5">
                <div>
                  <label for="new_password" class="text-sm font-medium text-gray-900 capitalize">
                    password
                  </label>
                </div>

                <div>
                  <MyInputPassword
                    id="new_password"
                    v-model={modelValue.value.new_password}
                    required
                    class="w-full"
                    autocomplete="new-password"
                  />
                </div>

                <ErrorMessage class="text-xs text-red-600" field="new_password"></ErrorMessage>
              </div>

              <div class="focus-container flex flex-col gap-0.5">
                <div>
                  <label for="confirm" class="text-sm font-medium text-gray-900 capitalize">
                    Please enter your password again
                  </label>
                </div>

                <div>
                  <MyInput
                    id="confirm"
                    v-model={modelValue.value.confirm}
                    type="password"
                    required
                    class="w-full"
                    autocomplete="new-password"
                  />
                </div>

                <ErrorMessage class="text-xs text-red-600" field="confirm"></ErrorMessage>
              </div>
            </section>

            <section class="flex gap-2">
              <MyButton type="submit" color="green" variant="contained" class="w-full">
                <span class="capitalize">signup</span>
              </MyButton>
            </section>
          </form>

          <section class="mt-8 flex flex-col items-end gap-1">
            <div class="text-sm font-light text-gray-500">
              Do you have an account?
              <RouterLink
                to={{ name: '/(auth)/signin' }}
                class="text-primary-600 font-medium text-blue-600 hover:underline"
              >
                Signin
              </RouterLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
});
