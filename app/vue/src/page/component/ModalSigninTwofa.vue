<script setup lang="ts">
import { AuthRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';

const modelValue = ref<z.infer<typeof AuthRouterSchema.signinTwofaInput>>({
  token: '',
});

const { validateSubmit, ErrorMessage, isDirty } = useVueValidateZod(
  AuthRouterSchema.signinTwofaInput,
  modelValue,
);

defineEmits<{
  success: [RouterOutput['auth']['signinTwofa']];
  close: [];
}>();
</script>

<template>
  <div class="rounded-lg bg-linear-to-b from-white to-gray-100 p-8 text-gray-900 shadow-xl">
    <form
      class="flex flex-col gap-6"
      autocomplete="off"
      @submit.prevent="
        validateSubmit(async () => {
          const loading = $modal.loading();
          try {
            const result = await trpc.auth.signinTwofa.mutate(modelValue);

            $emit('success', result);
          } finally {
            loading.close();
          }
        })()
      "
    >
      <section class="flex flex-col gap-3">
        <div class="focus-container flex flex-col gap-0.5">
          <div>
            <label for="token" class="text-sm capitalize"> authcode </label>
          </div>

          <p class="text-sm text-gray-400">Enter the authcode shown in the Authenticator app.</p>

          <div>
            <input
              id="token"
              v-model="modelValue.token"
              type="text"
              pattern="\d{6}"
              class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
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
          :disabled="!isDirty"
          color="green"
          variant="contained"
          class="w-full"
        >
          <span class="capitalize">authentication</span>
        </MyButton>
      </section>
    </form>
  </div>
</template>
