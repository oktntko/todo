'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { MyButton } from '@/component/button/MyButton';
import { ErrorMessage } from '@/component/ErrorMessage';
import { MyInput } from '@/component/input/MyInput';
import { MyInputPassword } from '@/component/input/MyInputPassword';
import { hono } from '@/middleware/hono';
import { CsrProvider } from '@/plugin/CsrProvider';
import { useDialog } from '@/plugin/useDialog';
import { AuthRouterSchema } from '~/schema';

function Contents() {
  const $router = useRouter();
  const $dialog = useDialog();

  const {
    register,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({ resolver: zodResolver(AuthRouterSchema.signupInput) });

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
                const _ = await hono.auth.signup.$post({ json: modelValue }).unwrap();

                return $router.push('/' /* '/space' */);
              } finally {
                loading.close();
              }
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
                    htmlFor="new_password"
                    className="text-sm font-medium text-gray-900 capitalize"
                  >
                    password
                  </label>
                </div>

                <div>
                  <MyInputPassword
                    id="new_password"
                    required
                    className="w-full"
                    autoComplete="new-password"
                    {...register('new_password')}
                  />
                </div>

                <ErrorMessage>{errors.new_password?.message}</ErrorMessage>
              </div>

              <div className="focus-container flex flex-col gap-0.5">
                <div>
                  <label htmlFor="confirm" className="text-sm font-medium text-gray-900 capitalize">
                    Please enter your password again
                  </label>
                </div>

                <div>
                  <MyInput
                    id="confirm"
                    type="password"
                    required
                    className="w-full"
                    autoComplete="new-password"
                    {...register('confirm')}
                  />
                </div>

                <ErrorMessage>{errors.confirm?.message}</ErrorMessage>
              </div>
            </section>

            <section className="flex gap-2">
              <MyButton type="submit" color="green" variant="contained" className="w-full">
                <span className="capitalize">signup</span>
              </MyButton>
            </section>
          </form>

          <section className="mt-8 flex flex-col items-end gap-1">
            <div className="text-sm font-light text-gray-500">
              Do you have an account?
              <Link
                href="/signin"
                className="text-primary-600 font-medium text-blue-600 hover:underline"
              >
                Signin
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <CsrProvider>
      <Contents />
    </CsrProvider>
  );
}
