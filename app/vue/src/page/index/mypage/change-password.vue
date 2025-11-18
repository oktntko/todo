<script setup lang="ts">
import { MypageRouterSchema } from '@todo/express/schema';
import { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { trpc } from '~/lib/trpc';

const modelValue = ref<z.infer<typeof MypageRouterSchema.patchPasswordInput>>({
  current_password: '',
  new_password: '',
  confirm: '',
});

const { validateSubmit, ErrorMessage, isDirty, reset } = useVueValidateZod(
  MypageRouterSchema.patchPasswordInput,
  modelValue,
);
</script>

<template>
  <form
    class="flex flex-col gap-6"
    autocomplete="off"
    @submit.prevent="
      validateSubmit(async () => {
        const loading = $loading.open();
        try {
          await trpc.mypage.patchPassword.mutate(modelValue);

          reset({
            current_password: '',
            new_password: '',
            confirm: '',
          });

          $toast.success('Password changed successfully.');
        } finally {
          loading.close();
        }
      })()
    "
  >
    <section class="flex flex-col gap-4">
      <div>
        <label
          for="current_password"
          class="mb-1 block text-sm font-medium text-gray-900 capitalize dark:text-white"
        >
          Current password
        </label>
        <input
          id="current_password"
          v-model.lazy="modelValue.current_password"
          type="password"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          autocomplete="current-password"
        />
        <ErrorMessage class="text-xs text-red-600" field="current_password" />
      </div>

      <div>
        <label
          for="new_password"
          class="mb-1 block text-sm font-medium text-gray-900 capitalize dark:text-white"
        >
          New password
        </label>
        <MyInputPassword
          id="new_password"
          v-model.lazy="modelValue.new_password"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          required
          autocomplete="new-password"
        />
        <ErrorMessage class="text-xs text-red-600" field="new_password" />
      </div>

      <div>
        <label
          for="confirm"
          class="mb-1 block text-sm font-medium text-gray-900 capitalize dark:text-white"
        >
          Confirm new password
        </label>
        <input
          id="confirm"
          v-model.lazy="modelValue.confirm"
          type="password"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          required
          autocomplete="new-password"
        />
        <ErrorMessage class="text-xs text-red-600" field="confirm" />
      </div>
    </section>

    <section class="flex gap-4">
      <button
        type="submit"
        :class="[
          'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
          'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
          'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
          'border-green-700 bg-green-600 text-white hover:bg-green-800',
          'capitalize',
        ]"
        :disabled="!isDirty"
      >
        change password
      </button>
    </section>
  </form>
</template>
