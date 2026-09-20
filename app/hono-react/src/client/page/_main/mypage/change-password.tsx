import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import { MypageRouterSchema } from '@/schema';
import { MyButton } from '~/component/button/MyButton';
import { ErrorMessage } from '~/component/ErrorMessage';
import { MyInput } from '~/component/input/MyInput';
import { MyInputPassword } from '~/component/input/MyInputPassword';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';

export const Route = createFileRoute('/_main/mypage/change-password')({
  component: function Page() {
    const $dialog = useDialog();
    const $toast = useToast();

    const {
      register,
      getValues,
      trigger,
      formState: { errors, isDirty },
      reset,
    } = useForm({
      defaultValues: {
        current_password: '',
        new_password: '',
        confirm: '',
      },
      resolver: zodResolver(MypageRouterSchema.patchPasswordInput),
    });

    return (
      <form
        className="flex flex-col gap-6"
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await trigger();
          if (!ok) return;

          const loading = $dialog.loading();
          try {
            const modelValue = getValues();
            await hono.mypage.patchPassword.$post({ json: modelValue }).unwrap();

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
        <section className="flex flex-col gap-3">
          {/* TODO: Chromeの警告対策で入れているだけ。 type="hidden"だと警告が出る */}
          <input name="username" autoComplete="username" className="hidden" />

          <div className="focus-container flex flex-col gap-0.5">
            <div>
              <label htmlFor="current_password" className="required text-sm capitalize">
                current password
              </label>
            </div>

            <div>
              <MyInput
                id="current_password"
                type="password"
                className="w-full"
                autoComplete="current-password"
                required
                {...register('current_password')}
              />
            </div>

            <ErrorMessage>{errors.current_password?.message}</ErrorMessage>
          </div>

          <div className="focus-container flex flex-col gap-0.5">
            <div>
              <label htmlFor="new_password" className="required text-sm capitalize">
                new password
              </label>
            </div>

            <div>
              <MyInputPassword
                id="new_password"
                className="w-full"
                autoComplete="new-password"
                required
                {...register('new_password')}
              />
            </div>

            <ErrorMessage>{errors.new_password?.message}</ErrorMessage>
          </div>

          <div className="focus-container flex flex-col gap-0.5">
            <div>
              <label htmlFor="confirm" className="required text-sm capitalize">
                confirm new password
              </label>
            </div>

            <div>
              <MyInput
                id="confirm"
                type="password"
                className="w-full"
                required
                autoComplete="new-password"
                {...register('confirm')}
              />
            </div>

            <ErrorMessage>{errors.confirm?.message}</ErrorMessage>
          </div>
        </section>

        <section className="flex gap-2">
          <MyButton type="submit" disabled={!isDirty} color="green" variant="contained">
            change password
          </MyButton>
        </section>
      </form>
    );
  },
});
