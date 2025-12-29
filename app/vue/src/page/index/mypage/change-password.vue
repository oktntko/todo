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
        const loading = $dialog.loading();
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
    <section class="flex flex-col gap-3">
      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="current_password" class="required text-sm capitalize">
            current password
          </label>
        </div>

        <div>
          <MyInput
            id="current_password"
            v-model="modelValue.current_password"
            type="password"
            class="w-full"
            autocomplete="current-password"
            required
          />
        </div>

        <ErrorMessage class="text-xs text-red-600" field="current_password" />
      </div>

      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="new_password" class="required text-sm capitalize"> new password </label>
        </div>

        <div>
          <MyInputPassword
            id="new_password"
            v-model="modelValue.new_password"
            class="w-full"
            autocomplete="new-password"
            required
          />
        </div>

        <ErrorMessage class="text-xs text-red-600" field="new_password" />
      </div>

      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="confirm" class="required text-sm capitalize"> confirm new password </label>
        </div>

        <div>
          <MyInput
            id="confirm"
            v-model="modelValue.confirm"
            type="password"
            class="w-full"
            required
            autocomplete="new-password"
          />
        </div>

        <ErrorMessage class="text-xs text-red-600" field="confirm" />
      </div>
    </section>

    <section class="flex gap-2">
      <MyButton type="submit" :disabled="!isDirty" color="green" variant="contained">
        change password
      </MyButton>
    </section>
  </form>
</template>
