'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { useMainState } from '@/(main)/component/MainState/useMainState';
import { MyButton } from '@/component/button/MyButton';
import { MyInput } from '@/component/input/MyInput';
import { MyLoading } from '@/component/MyLoading';
import { hono } from '@/middleware/hono';
import { useDialog } from '@/plugin/useDialog';
import { useToast } from '@/plugin/useToast';
import { cn } from '~/lib/cn';

export default function Page() {
  const { space_id } = useParams<{ space_id: string }>();

  const $dialog = useDialog();
  const $toast = useToast();

  const { space_list, setSpaceList } = useMainState();
  const currentSpace = space_list.find((x) => x.space_id === space_id);

  const [aichat_api_key, setAichatApiKey] = useState('');
  const [open, setOpen] = useState(false);

  if (currentSpace == null) {
    return <MyLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div
          className={cn(
            'flex flex-col gap-4 border-t-2 p-4',
            currentSpace.aichat_enable
              ? 'border-blue-300 bg-blue-50'
              : 'border-yellow-300 bg-yellow-50',
          )}
          role="alert"
        >
          <div className="flex items-center gap-4">
            <span className="sr-only">Info</span>
            <span
              className={cn(
                'icon-[fluent-color--chat-more-16] h-32 w-32',
                currentSpace.aichat_enable ? 'text-blue-900' : 'text-yellow-900',
              )}
            ></span>

            <div>
              <h3
                className={cn(
                  'text-lg font-medium',
                  currentSpace.aichat_enable ? 'text-blue-900' : 'text-yellow-900',
                )}
              >
                {currentSpace.aichat_enable ? 'AI Chat is enabled.' : 'AI Chat is not enabled.'}
              </h3>
              {currentSpace.aichat_enable ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
                  onClick={async () => {
                    await $dialog.confirm.warn('Do you want to disable AI Chat?');

                    const loading = $dialog.loading();
                    try {
                      const space = await hono.space.disableAichat
                        .$post({
                          json: {
                            space_id: currentSpace.space_id,
                            updated_at: currentSpace.updated_at,
                          },
                        })
                        .unwrap();

                      setSpaceList((prev) => {
                        return prev.map((x) => (x.space_id === space.space_id ? space : x));
                      });

                      $toast.success('AI Chat has been disabled.');
                    } finally {
                      loading.close();
                    }
                  }}
                >
                  <span className="capitalize">disable</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm text-gray-700 transition-colors hover:text-blue-600"
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  Enter AI Chat API Key
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 有効化フォーム */}

      <section className="flex flex-col gap-4">
        <AnimatePresence>
          {open && (
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
                    Create new secret key in&nbsp;
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer text-blue-500 hover:text-blue-600"
                    >
                      OpenAI
                    </a>
                    .
                  </h3>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.form
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: 0.2 }}
              autoComplete="off"
              onSubmit={async (e) => {
                e.preventDefault();

                const loading = $dialog.loading();
                try {
                  const space = await hono.space.enableAichat
                    .$post({
                      json: {
                        space_id: currentSpace.space_id,
                        updated_at: currentSpace.updated_at,
                        aichat_api_key,
                      },
                    })
                    .unwrap();

                  setOpen(false);
                  setSpaceList((prev) => {
                    return prev.map((x) => (x.space_id === space.space_id ? space : x));
                  });

                  $toast.success('AI Chat was enabled successfully. ');
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
                  <span className="leading-tight font-medium">Copy-paste the secret key.</span>
                </span>
              </label>

              <div>
                <div className="flex items-center gap-2">
                  <MyInput
                    id="aichat_api_key"
                    type="text"
                    className="w-full"
                    required
                    maxLength={255}
                    value={aichat_api_key}
                    onChange={(e) => {
                      setAichatApiKey(e.target.value);
                    }}
                  />
                </div>
              </div>

              <section className="flex gap-2">
                <MyButton
                  type="submit"
                  disabled={!aichat_api_key}
                  color="green"
                  variant="contained"
                >
                  <span className="capitalize">enable AI chat</span>
                </MyButton>
              </section>
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
