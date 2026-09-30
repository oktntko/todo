import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { MyButton } from '@/component/button/MyButton';
import { ErrorMessage } from '@/component/ErrorMessage';
import { MyInput } from '@/component/input/MyInput';
import { hono } from '@/middleware/hono';
import { useDialog } from '@/plugin/useDialog';
import { AuthRouterSchema } from '~/schema';

type Props = {
  onSuccess: (auth: boolean) => void;
};

export function ModalSigninTwofa(props: Props) {
  const $dialog = useDialog();

  const {
    register,
    getValues,
    trigger,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      token: '',
    },
    resolver: zodResolver(AuthRouterSchema.signinTwofaInput),
  });

  return (
    <div className="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
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
            const { auth } = await hono.auth.signinTwofa.$post({ json: modelValue }).unwrap();

            props.onSuccess(auth);
          } finally {
            loading.close();
          }
        }}
      >
        <section className="flex flex-col gap-3">
          <div className="focus-container flex flex-col gap-0.5">
            <div>
              <label htmlFor="token" className="text-sm capitalize">
                authcode
              </label>
            </div>

            <p className="text-sm text-gray-400">
              Enter the authcode shown in the Authenticator app.
            </p>

            <div>
              <MyInput
                id="token"
                type="text"
                pattern="\d{6}"
                className="w-full"
                required
                maxLength={6}
                {...register('token')}
              />
            </div>

            <ErrorMessage>{errors.token?.message}</ErrorMessage>
          </div>
        </section>

        <section className="flex gap-2">
          <MyButton
            type="submit"
            disabled={!isDirty}
            color="green"
            variant="contained"
            className="w-full"
          >
            <span className="capitalize">authentication</span>
          </MyButton>
        </section>
      </form>
    </div>
  );
}
