import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { MypageRouterSchema } from '@/schema';
import { MyButton } from '~/component/button/MyButton';
import { ErrorMessage } from '~/component/ErrorMessage';
import { MyInput } from '~/component/input/MyInput';
import { MyTextarea } from '~/component/input/MyTextarea';
import { cn } from '~/lib/cn';
import { bytesToBase64 } from '~/lib/file';
import { hono } from '~/middleware/hono';
import { useDialog } from '~/plugin/useDialog';
import { useToast } from '~/plugin/useToast';
import { mypageAtom } from '~/store/MypageStore';

export const Route = createFileRoute('/_main/mypage/')({
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
      setValue,
      control,
    } = useForm({
      defaultValues: {
        ...mypage,
      },
      resolver: zodResolver(MypageRouterSchema.patchProfileInput),
    });

    const [dragging, setDragging] = useState(false);

    async function handleFileInput(files?: FileList | null) {
      if (files == null || files.length === 0) {
        return;
      }

      const file = files[0]!;

      if (!file.type.startsWith('image/')) {
        return $dialog.alert.info('Choose a IMAGE file.');
      }

      if (file.size > 1024 * 15 /* 15kb */) {
        // MySQL TEXT 最大 65,535 バイト BASE64エンコードで約3倍になる
        // 65,535 / 4 = 16383.75 バイト ≒ 15.9kb => 15kb
        return $dialog.alert.info('The upper limit is 15kb.');
      }

      setValue('avatar_image', await bytesToBase64(file), { shouldDirty: true });
    }

    const avatar_image = useWatch({ control, name: 'avatar_image' });

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
            const updatedMypage = await hono.mypage.patchProfile
              .$post({ json: modelValue })
              .unwrap();
            setMypage(updatedMypage);

            reset(updatedMypage);

            $toast.success('Data saved successfully.');
          } finally {
            loading.close();
          }
        }}
      >
        <section className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <div className="flex grow flex-col gap-3">
            {/* 名前 */}
            <div className="focus-container flex flex-col gap-0.5">
              <div>
                <label htmlFor="username" className="required text-sm capitalize">
                  username
                </label>
              </div>

              <div>
                <MyInput
                  id="username"
                  type="text"
                  className="w-full"
                  required
                  {...register('username')}
                />
              </div>

              <ErrorMessage>{errors.username?.message}</ErrorMessage>
            </div>

            {/* メールアドレス */}
            <div className="focus-container flex flex-col gap-0.5">
              <div>
                <label htmlFor="email" className="required text-sm capitalize">
                  email address
                </label>
              </div>

              <div>
                <MyInput
                  id="email"
                  type="email"
                  className="w-full"
                  required
                  {...register('email')}
                />
              </div>

              <ErrorMessage>{errors.email?.message}</ErrorMessage>
            </div>

            {/* 自己紹介 */}
            <div className="focus-container flex flex-col gap-0.5">
              <div>
                <label htmlFor="description" className="optional text-sm capitalize">
                  description
                </label>
              </div>

              <div>
                <MyTextarea
                  id="description"
                  rows={4}
                  className="w-full"
                  {...register('description')}
                ></MyTextarea>
              </div>

              <ErrorMessage>{errors.description?.message}</ErrorMessage>
            </div>
          </div>

          {/* 画像 */}
          <div className="flex flex-col items-center gap-3">
            {avatar_image ? (
              <div className="relative h-64 w-64">
                <img
                  src={avatar_image}
                  width="256"
                  height="256"
                  decoding="async"
                  className="h-64 w-64 rounded-sm object-cover object-center"
                  alt="avatar"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 transition-colors hover:bg-gray-200"
                  aria-label="Close"
                  onClick={() => {
                    setValue('avatar_image', '', { shouldDirty: true });
                  }}
                >
                  <span className="icon-[bi--x] h-4 w-4" />
                </button>
              </div>
            ) : (
              // 画像がないとき
              <label
                className={cn(
                  'relative flex h-64 w-64 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border-2 border-dashed border-gray-300 bg-gray-100 px-1 text-center text-gray-400 transition-colors hover:bg-gray-200',
                  dragging ? 'border-gray-500 bg-gray-200' : '',
                )}
                onDragEnter={() => {
                  setDragging(true);
                }}
                onDragLeave={(e) => {
                  // 子要素へ dragenter すると自身の dragleave が発火するため、子要素かどうか判定する
                  // https://qiita.com/keiliving/items/5e8b26e6567efbc15765
                  if (e.relatedTarget && e.currentTarget) {
                    const currentTarget = e.currentTarget as Node;
                    const relatedTarget = e.relatedTarget as Node;
                    if (currentTarget.contains(relatedTarget)) {
                      return;
                    }
                  }

                  setDragging(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  return handleFileInput(e.dataTransfer?.files);
                }}
              >
                <span className="sr-only capitalize">group image</span>
                <span className="icon-[ri--image-circle-fill] h-32 w-32"> </span>
                <span className="text-xs capitalize">limit: 15kb</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileInput((e.target as HTMLInputElement | null)?.files)}
                />
              </label>
            )}
          </div>
        </section>

        <section className="flex gap-2">
          <MyButton type="submit" disabled={!isDirty} color="green" variant="contained">
            <span className="capitalize">save</span>
          </MyButton>
        </section>
      </form>
    );
  },
});
