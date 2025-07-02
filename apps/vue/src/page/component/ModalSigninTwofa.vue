<script setup lang="ts">
import { AuthRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useValidate } from '~/composable/useValidate';
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';

const modelValue = ref<z.infer<typeof AuthRouterSchema.signinTwofaInput>>({
  token: '',
});

const { validateSubmit, ErrorMessage } = useValidate(AuthRouterSchema.signinTwofaInput, modelValue);

defineEmits<{
  close: [result?: RouterOutput['auth']['signinTwofa']];
}>();
</script>

<template>
  <form
    class="laptop:max-w-3xl desktop:max-w-4xl flex flex-col gap-8"
    :class="['container mx-auto w-96 p-4']"
    autocomplete="off"
    @submit.prevent="
      validateSubmit(async () => {
        const loading = $loading.open();
        try {
          const result = await trpc.auth.signinTwofa.mutate(modelValue);

          $emit('close', result);
        } finally {
          loading.close();
        }
      })()
    "
  >
    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="token" class="text-sm font-medium text-gray-900"> 認証コード </label>
        <p class="text-sm text-gray-400">
          Authenticatorアプリに表示される6桁の数字を入力してください。
        </p>
        <input
          id="token"
          v-model.lazy="modelValue.token"
          type="text"
          pattern="\d{6}"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          required
          maxlength="6"
        />
        <ErrorMessage class="text-xs text-red-600" for="token"></ErrorMessage>
      </div>
    </section>

    <section>
      <button
        type="submit"
        :class="[
          'inline-flex cursor-pointer items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
          'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
          'border-green-700 bg-green-600 text-white hover:bg-green-800',
        ]"
      >
        認証
      </button>
    </section>
  </form>
</template>
