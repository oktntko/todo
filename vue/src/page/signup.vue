<script setup lang="ts">
useTitle('アカウントを作る | MyTodo');

import type { z } from 'zod';
import { useValidate } from '~/composable/useValidate';
import { trpc } from '~/lib/trpc';
import { AuthRouterSchema } from '~/schema/AuthRouterSchema';

const router = useRouter();

const modelValue = ref<z.infer<typeof AuthRouterSchema.signupInput>>({
  email: 'example@example.com',
  new_password: '',
  confirm: '',
});

const { validateSubmit, ErrorMessage } = useValidate(AuthRouterSchema.signupInput, modelValue);
</script>

<template>
  <div class="bg-gradient-to-b from-white to-gray-200">
    <div class="mx-auto flex h-screen flex-col items-center justify-center px-6 py-8 lg:py-0">
      <!-- タイトル -->
      <h1 class="mb-6 flex items-center text-2xl font-semibold text-gray-900">
        <span class="icon-[vscode-icons--file-type-light-todo] ml-[-16px] h-10 w-10 p-2"> </span>
        <span class="">MyTodo</span>
      </h1>

      <!-- ボックス -->
      <div
        class="w-full rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-md sm:max-w-md sm:p-8 md:mt-0"
      >
        <form
          class="flex flex-col gap-8"
          @submit.prevent="
            validateSubmit(async () => {
              const loading = $loading.open();
              try {
                await trpc.auth.signup.mutate(modelValue);

                router.push('/');
              } finally {
                loading.close();
              }
            })()
          "
        >
          <section class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label for="email" class="text-sm font-medium text-gray-900"> メールアドレス </label>
              <input
                id="email"
                v-model.lazy="modelValue.email"
                type="email"
                required
                class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
                autocomplete="username"
              />
              <ErrorMessage class="text-xs text-red-600" for="email"></ErrorMessage>
            </div>
            <div class="flex flex-col gap-1">
              <label for="new_password" class="text-sm font-medium text-gray-900">
                パスワード
              </label>
              <MyInputPassword
                id="new_password"
                v-model.lazy="modelValue.new_password"
                required
                class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
                autocomplete="new-password"
              />
              <ErrorMessage class="text-xs text-red-600" for="new_password"></ErrorMessage>
            </div>
            <div class="flex flex-col gap-1">
              <label for="confirm" class="text-sm font-medium text-gray-900">
                (確認用)もう一度パスワードを入力してください
              </label>
              <input
                id="confirm"
                v-model.lazy="modelValue.confirm"
                type="password"
                required
                class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
              />
              <ErrorMessage class="text-xs text-red-600" for="confirm"></ErrorMessage>
            </div>
          </section>

          <section>
            <button
              :class="[
                'inline-flex items-center justify-center shadow-sm transition-all focus:outline-none focus:ring',
                'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
                'border-green-700 bg-green-600 text-white hover:bg-green-800',
                'w-full',
              ]"
              type="submit"
            >
              登録
            </button>
          </section>
        </form>

        <section class="mt-8 flex flex-col items-end">
          <div class="text-sm font-light text-gray-500">
            アカウントを持っていますか？
            <RouterLink
              to="/login"
              class="text-primary-600 font-medium text-blue-600 hover:underline"
            >
              ログインする
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
