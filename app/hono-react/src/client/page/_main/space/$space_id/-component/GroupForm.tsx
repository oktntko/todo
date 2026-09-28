import { useState, type ReactNode, type SubmitEventHandler } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { MyButton } from '~/component/button/MyButton';
import { ErrorMessage } from '~/component/ErrorMessage';
import { MyInput } from '~/component/input/MyInput';
import { MyTextarea } from '~/component/input/MyTextarea';
import { cn } from '~/lib/cn';
import { bytesToBase64 } from '~/lib/file';
import { useDialog } from '~/plugin/useDialog';

import type { GroupFormValue } from './useGroupForm';

type Props = {
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  buttons?: ReactNode;
};

export function GroupForm({ onSubmit, buttons }: Props) {
  const $dialog = useDialog();

  const {
    register,
    formState: { errors, isDirty },
    setValue,
    control,
  } = useFormContext<GroupFormValue>();

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

    setValue('group_image', await bytesToBase64(file), { shouldDirty: true });
  }

  const group_image = useWatch({ control, name: 'group_image' });

  return (
    <form className="flex flex-col gap-6" autoComplete="off" onSubmit={onSubmit}>
      <section className="flex flex-col gap-3">
        <div className="flex gap-6">
          <div className="flex items-start">
            {group_image ? (
              // 画像があるとき
              <div className="relative h-16 w-16">
                <img
                  src={group_image}
                  width="64"
                  height="64"
                  decoding="async"
                  className="h-16 w-16 rounded-sm object-cover object-center"
                  alt="group image"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 transition-colors hover:bg-gray-200"
                  aria-label="Close"
                  onClick={() => {
                    setValue('group_image', '', { shouldDirty: true });
                  }}
                >
                  <span className="icon-[bi--x] h-4 w-4" />
                </button>
              </div>
            ) : (
              // 画像がないとき
              <label
                className={cn(
                  'relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border-2 border-dashed border-gray-300 bg-gray-100 px-1 text-center text-gray-400 transition-colors hover:bg-gray-200',
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
                <span className="icon-[ri--image-circle-fill] h-4 w-4"> </span>
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

          <div className="focus-container flex grow flex-col gap-0.5">
            <div>
              <label htmlFor="group_name" className="required text-sm capitalize">
                name
              </label>
            </div>

            <div>
              <MyInput
                id="group_name"
                type="text"
                className="w-full"
                maxLength={100}
                required
                {...register('group_name')}
              />
            </div>

            <ErrorMessage>{errors.group_name?.message}</ErrorMessage>
          </div>

          <div className="focus-container flex flex-col gap-0.5">
            <div>
              <label htmlFor="group_color" className="text-sm capitalize">
                color
              </label>
            </div>

            <div className="grow">
              <MyInput
                id="group_color"
                list="color-picker"
                type="color"
                className="h-full w-16 p-1!"
                {...register('group_color')}
              />
            </div>

            <ErrorMessage>{errors.group_color?.message}</ErrorMessage>
          </div>
        </div>

        <div className="focus-container flex flex-col gap-0.5">
          <div>
            <label htmlFor="group_description" className="optional text-sm capitalize">
              description
            </label>
          </div>

          <div>
            <MyTextarea
              id="group_description"
              className="w-full"
              rows={4}
              maxLength={400}
              {...register('group_description')}
            ></MyTextarea>
          </div>

          <ErrorMessage>{errors.group_description?.message}</ErrorMessage>
        </div>
      </section>

      <section className="flex gap-2">
        <MyButton type="submit" disabled={!isDirty} color="green" variant="contained">
          <span className="capitalize">save</span>
        </MyButton>

        {buttons}
      </section>
    </form>
  );
}
