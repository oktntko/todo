import { MypageRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, ref } from 'vue';
import MyButton from '~/component/button/MyButton.tsx';
import MyInput from '~/component/input/MyInput.vue';
import MyInputPassword from '~/component/input/MyInputPassword.vue';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

export default defineComponent(() => {
  const $dialog = useDialog();
  const $toast = useToast();

  const modelValue = ref<z.infer<typeof MypageRouterSchema.patchPasswordInput>>({
    current_password: '',
    new_password: '',
    confirm: '',
  });

  const { validate, ErrorMessage, isDirty, reset } = useVueValidateZod(
    MypageRouterSchema.patchPasswordInput,
    modelValue,
  );

  return () => (
    <form
      class="flex flex-col gap-6"
      autocomplete="off"
      onSubmit={async (e) => {
        e.preventDefault();
        const result = await validate();
        if (!result.success) return;

        const loading = $dialog.loading();
        try {
          await trpc.mypage.patchPassword.mutate(modelValue.value);

          reset({
            current_password: '',
            new_password: '',
            confirm: '',
          });

          $toast.success('Password changed successfully.');
        } finally {
          loading.close();
        }
      }}
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
              v-model={modelValue.value.current_password}
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
            <label for="new_password" class="required text-sm capitalize">
              new password
            </label>
          </div>

          <div>
            <MyInputPassword
              id="new_password"
              v-model={modelValue.value.new_password}
              class="w-full"
              autocomplete="new-password"
              required
            />
          </div>

          <ErrorMessage class="text-xs text-red-600" field="new_password" />
        </div>

        <div class="focus-container flex flex-col gap-0.5">
          <div>
            <label for="confirm" class="required text-sm capitalize">
              confirm new password
            </label>
          </div>

          <div>
            <MyInput
              id="confirm"
              v-model={modelValue.value.confirm}
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
        <MyButton type="submit" disabled={!isDirty.value} color="green" variant="contained">
          change password
        </MyButton>
      </section>
    </form>
  );
});
