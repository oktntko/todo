import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import { AuthRouterSchema } from '@/schema';
import { MyButton } from '~/component/button/MyButton';
import { ErrorMessage } from '~/component/ErrorMessage';
import { MyInput } from '~/component/input/MyInput';
import { MyInputPassword } from '~/component/input/MyInputPassword';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';

export const Route = createFileRoute('/_auth/signin')({
  component: function Page() {
    const $navigate = useNavigate();
    const $dialog = useDialog();

    const {
      register,
      getValues,
      trigger,
      formState: { errors },
    } = useForm({
      defaultValues: {
        email: 'example@example.com',
        password: '',
      },
      resolver: zodResolver(AuthRouterSchema.signinInput),
    });

    return (
      <div className="bg-gray-50">
        <div className="mx-auto flex h-screen flex-col items-center justify-center px-6 py-8 lg:py-0">
          {/* タイトル */}
          <h1 className="mx-auto mb-6 flex items-center gap-1 text-2xl font-semibold">
            <span className="icon-[flat-color-icons--todo-list] -ml-4 h-8 w-8 p-2"></span>
            <span className="">MyTodo</span>
          </h1>

          {/* ボックス */}
          <div className="w-full rounded-lg border border-gray-200 bg-gray-100 p-6 shadow-md sm:max-w-md sm:p-8 md:mt-0">
            <form
              className="flex flex-col gap-6"
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await trigger();
                if (!ok) return;

                const loading = $dialog.loading();
                try {
                  const modelValue = getValues();
                  const { auth } = await hono.auth.signin.$post({ json: modelValue }).unwrap();

                  if (auth) {
                    return $navigate({ to: '/space' });
                  }
                } finally {
                  loading.close();
                }

                // 二要素認証
                // TODO
                // await $dialog.showModal(ModalSigninTwofa, (resolve) => ({
                //   onSuccess: resolve,
                // }));

                return $navigate({ to: '/space' });
              }}
            >
              <section className="flex flex-col gap-3">
                <div className="focus-container flex flex-col gap-0.5">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-900 capitalize">
                      email address
                    </label>
                  </div>

                  <div>
                    <MyInput
                      id="email"
                      type="email"
                      required
                      className="w-full"
                      autoComplete="username"
                      {...register('email')}
                    />
                  </div>

                  <ErrorMessage>{errors.email?.message}</ErrorMessage>
                </div>

                <div className="focus-container flex flex-col gap-0.5">
                  <div>
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-900 capitalize"
                    >
                      password
                    </label>
                  </div>

                  <div>
                    <MyInputPassword
                      id="password"
                      required
                      autoComplete="current-password"
                      className="w-full"
                      {...register('password')}
                    />
                  </div>

                  <ErrorMessage>{errors.password?.message}</ErrorMessage>
                </div>
              </section>

              <section className="flex gap-2">
                <MyButton type="submit" color="green" variant="contained" className="w-full">
                  <span className="capitalize">signin</span>
                </MyButton>
              </section>
            </form>

            <section className="mt-8 flex flex-col items-end gap-1">
              <div className="text-sm font-light text-gray-500">
                <Link to="/" className="font-medium text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="text-sm font-light text-gray-500">
                <Link to="/signup" className="font-medium text-blue-600 hover:underline">
                  Create an account
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  },
});
