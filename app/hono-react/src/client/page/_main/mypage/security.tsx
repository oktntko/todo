import type { InferResponseType } from 'hono';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { MypageRouterSchema } from '@/schema';
import { MyButton } from '~/component/button/MyButton';
import { ErrorMessage } from '~/component/ErrorMessage';
import { MyInput } from '~/component/input/MyInput';
import { cn } from '~/lib/cn';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';
import { mypageAtom } from '~/store/MypageStore';

export const Route = createFileRoute('/_main/mypage/security')({
  component: function Page() {
    const $dialog = useDialog();
    const $toast = useToast();

    const [mypage, setMypage] = useAtom(mypageAtom);

    const {
      register,
      getValues,
      trigger,
      formState: { errors, isDirty },
      reset,
      control,
    } = useForm({
      defaultValues: {
        token: '',
      },
      resolver: zodResolver(MypageRouterSchema.enableSecretInput),
    });

    const token = useWatch({ control, name: 'token' });

    const [qrcode, setQrcode] = useState<
      InferResponseType<typeof hono.mypage.generateSecret.$post>
    >({
      dataurl: '',
    });

    return (
      <div className="flex flex-col gap-6">
        {/* status */}
        <section>
          <div
            className={cn(
              'flex flex-col gap-4 border-t-2 p-4',
              mypage.twofa_enable ? 'border-blue-300 bg-blue-50' : 'border-yellow-300 bg-yellow-50',
            )}
            role="alert"
          >
            <div className="flex items-center gap-4">
              <span className="sr-only">Info</span>

              {mypage.twofa_enable ? (
                <span className="icon-[wpf--security-checked] h-32 w-32 text-green-400" />
              ) : (
                <span className="icon-[fluent-emoji-flat--light-bulb] h-32 w-32" />
              )}

              <div>
                <h3
                  className={cn(
                    'text-lg font-medium',
                    mypage.twofa_enable ? 'text-blue-900' : 'text-yellow-900',
                  )}
                >
                  {mypage.twofa_enable
                    ? 'Two-factor authentication is enabled.'
                    : 'Two-factor authentication is not enabled.'}
                </h3>

                {mypage.twofa_enable ? (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
                    onClick={async () => {
                      await $dialog.confirm.warn(
                        'Do you want to disable two-factor authentication?',
                      );

                      const loading = $dialog.loading();
                      try {
                        await hono.mypage.disableSecret.$post().unwrap();
                        setMypage((prev) => ({ ...prev, twofa_enable: false }));
                        $toast.success('Two-factor authentication has been disabled.');
                      } finally {
                        loading.close();
                      }
                    }}
                  >
                    <span className="icon-[fluent-emoji-flat--light-bulb] mr-2 -ml-1 h-4 w-4"></span>
                    <span className="capitalize">disable</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
                    onClick={async () => {
                      setQrcode(await hono.mypage.generateSecret.$post().unwrap());
                      return (document.getElementById('token') as HTMLInputElement)?.focus();
                    }}
                  >
                    <span className="icon-[wpf--security-checked] mr-2 -ml-1 h-4 w-4 text-green-400" />
                    Start two-factor authentication setup
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* enable form */}
        <section className="flex flex-col gap-4">
          <AnimatePresence>
            {qrcode.dataurl && (
              <motion.div
                className="flex flex-col gap-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600">
                    1
                  </span>
                  <div>
                    <h3 className="leading-tight font-medium">
                      Scan the QR code with the Authenticator app.
                    </h3>
                    <p className="text-sm text-gray-400">
                      Popular authenticator apps include
                      <a
                        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-blue-500 hover:text-blue-600"
                      >
                        &nbsp;Google Authenticator&nbsp;
                      </a>
                      and
                      <a
                        href="https://play.google.com/store/apps/details?id=com.azure.authenticator"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer text-blue-500 hover:text-blue-600"
                      >
                        &nbsp;Microsoft Authenticator&nbsp;
                      </a>
                      .
                    </p>
                  </div>
                </div>

                <img src={qrcode.dataurl} width={128} height={128} decoding="async" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {qrcode.dataurl && (
              <motion.form
                className="flex flex-col gap-4"
                autoComplete="off"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: 0.2 }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const ok = await trigger();
                  if (!ok) return;

                  const loading = $dialog.loading();
                  try {
                    const modelValue = getValues();
                    await hono.mypage.enableSecret.$post({ json: modelValue });

                    reset({
                      token: '',
                    });
                    setQrcode((prev) => ({ ...prev, dataurl: '' }));
                    setMypage((prev) => ({ ...prev, twofa_enable: true }));

                    $toast.success('Two-factor authentication was enabled successfully.');
                  } finally {
                    loading.close();
                  }
                }}
              >
                <label htmlFor="token" className="flex items-center space-x-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600">
                    2
                  </span>
                  <span>
                    <span className="leading-tight font-medium">Validate your code.</span>
                    <span className="block text-sm text-gray-400">
                      Enter the authcode shown in the Authenticator app.
                    </span>
                  </span>
                </label>

                <div>
                  <div className="flex items-center gap-2">
                    <MyInput
                      id="token"
                      type="text"
                      pattern="\d{6}"
                      className="w-24"
                      required
                      maxLength={6}
                      {...register('token')}
                    />
                    <span className="text-xs text-gray-400">{token.length}/6 char</span>
                  </div>
                  <ErrorMessage>{errors.token?.message}</ErrorMessage>
                </div>

                <section className="flex gap-2">
                  <MyButton type="submit" disabled={!isDirty} color="green" variant="contained">
                    <span className="capitalize">enable two-factor authentication</span>
                  </MyButton>
                </section>
              </motion.form>
            )}
          </AnimatePresence>
        </section>
      </div>
    );
  },
});
