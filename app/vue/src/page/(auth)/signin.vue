<script setup lang="ts">
useTitle('Signin | MyTodo');

import { AuthRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { trpc } from '~/lib/trpc';
import ModalSigninTwofa from '~/page/component/ModalSigninTwofa.vue';

const router = useRouter();

const modelValue = ref<z.infer<typeof AuthRouterSchema.signinInput>>({
  email: 'example@example.com',
  password: '',
});

const { validateSubmit, ErrorMessage } = useVueValidateZod(
  AuthRouterSchema.signinInput,
  modelValue,
);
</script>

<template>
  <div class="bg-gray-50">
    <div class="mx-auto flex h-screen flex-col items-center justify-center px-6 py-8 lg:py-0">
      <!-- タイトル -->
      <h1 class="mx-auto mb-6 flex items-center gap-1 text-2xl font-semibold">
        <span class="icon-[flat-color-icons--todo-list] -ml-4 h-8 w-8 p-2"></span>
        <span class="">MyTodo</span>
      </h1>

      <!-- ボックス -->
      <div
        class="w-full rounded-lg border border-gray-200 bg-gray-100 p-6 shadow-md sm:max-w-md sm:p-8 md:mt-0"
      >
        <form
          class="flex flex-col gap-6"
          @submit.prevent="
            validateSubmit(async () => {
              const loading = $dialog.loading();
              try {
                const { auth } = await trpc.auth.signin.mutate(modelValue);
                if (auth) {
                  router.push({ name: '//todo/list' });
                  return;
                }
              } finally {
                loading.close();
              }

              // 二要素認証
              await $dialog.showModal(ModalSigninTwofa, (resolve) => ({
                onSuccess: resolve,
              }));

              router.push({ name: '//todo/list' });
            })()
          "
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
                  v-model.lazy="modelValue.email"
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
                <label for="password" class="text-sm font-medium text-gray-900 capitalize">
                  password
                </label>
              </div>

              <div>
                <MyInputPassword
                  id="password"
                  v-model.lazy="modelValue.password"
                  required
                  autocomplete="current-password"
                  class="w-full"
                />
              </div>

              <ErrorMessage class="text-xs text-red-600" field="email"></ErrorMessage>
            </div>
          </section>

          <section class="flex gap-2">
            <MyButton type="submit" color="green" variant="contained" class="w-full">
              <span class="capitalize">signin</span>
            </MyButton>
          </section>
        </form>

        <section class="mt-8 flex flex-col items-end gap-1">
          <div class="text-sm font-light text-gray-500">
            <RouterLink to="#" class="text-primary-600 font-medium text-blue-600 hover:underline">
              Forgot password?
            </RouterLink>
          </div>
          <div class="text-sm font-light text-gray-500">
            <RouterLink
              :to="{ name: '/(auth)/signup' }"
              class="text-primary-600 font-medium text-blue-600 hover:underline"
            >
              Create an account
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
