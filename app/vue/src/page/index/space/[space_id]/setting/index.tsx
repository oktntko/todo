import type { z } from '@todo/lib/zod';

import { SpaceRouterSchema } from '@todo/express/schema';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, ref } from 'vue';

import MyButton from '~/component/button/MyButton.tsx';
import MyInput from '~/component/input/MyInput.vue';
import MyTextarea from '~/component/input/MyTextarea.vue';
import { bytesToBase64 } from '~/lib/file';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

import { useCurrentSpace } from '../../[space_id]';

export default defineComponent(() => {
  const $dialog = useDialog();
  const $toast = useToast();

  const currentSpace = useCurrentSpace();

  const modelValue = ref<z.infer<typeof SpaceRouterSchema.updateInput>>({
    ...currentSpace.value,
  });

  const { validate, ErrorMessage, isDirty, reset } = useVueValidateZod(
    SpaceRouterSchema.updateInput,
    modelValue,
  );

  const dragging = ref(false);

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

    modelValue.value.space_image = await bytesToBase64(file);
  }

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
          const updatedSpace = await trpc.space.update.mutate(modelValue.value);
          currentSpace.value = updatedSpace;

          reset(updatedSpace);

          $toast.success('Data saved successfully.');
        } finally {
          loading.close();
        }
      }}
    >
      <section class="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <div class="flex grow flex-col gap-3">
          {/* 名前 */}
          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="space_name" class="required text-sm capitalize">
                name
              </label>
            </div>

            <div>
              <MyInput
                id="username"
                v-model={modelValue.value.space_name}
                type="text"
                class="w-full"
                required
              />
            </div>

            <ErrorMessage class="text-xs text-red-600" field="space_name" />
          </div>

          {/* 自己紹介 */}
          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="space_description" class="optional text-sm capitalize">
                description
              </label>
            </div>

            <div>
              <MyTextarea
                id="description"
                v-model={modelValue.value.space_description}
                rows="4"
                class="w-full"
              ></MyTextarea>
            </div>

            <ErrorMessage class="text-xs text-red-600" field="space_description" />
          </div>
        </div>

        {/* 画像 */}
        <div class="flex flex-col items-center gap-3">
          {modelValue.value.space_image ? (
            <div class="relative h-64 w-64">
              <img
                src={modelValue.value.space_image}
                width="256"
                height="256"
                decoding="async"
                class="h-64 w-64 rounded-sm object-cover object-center"
                alt="avatar"
              />
              <button
                type="button"
                class="absolute -top-2 -right-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 transition-colors hover:bg-gray-200"
                aria-label="Close"
                onClick={() => {
                  modelValue.value.space_image = '';
                }}
              >
                <span class="icon-[bi--x] h-4 w-4" />
              </button>
            </div>
          ) : (
            // 画像がないとき
            <label
              class={[
                'relative flex h-64 w-64 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border-2 border-dashed border-gray-300 bg-gray-100 px-1 text-center text-gray-400 transition-colors hover:bg-gray-200',
                dragging.value ? 'border-gray-500 bg-gray-200' : '',
              ]}
              onDragenter={() => {
                dragging.value = true;
              }}
              onDragleave={(e) => {
                // 子要素へ dragenter すると自身の dragleave が発火するため、子要素かどうか判定する
                // https://qiita.com/keiliving/items/5e8b26e6567efbc15765
                if (e.relatedTarget && e.currentTarget) {
                  const currentTarget = e.currentTarget as Node;
                  const relatedTarget = e.relatedTarget as Node;
                  if (currentTarget.contains(relatedTarget)) {
                    return;
                  }
                }

                dragging.value = false;
              }}
              onDragover={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                dragging.value = false;
                return handleFileInput(e.dataTransfer?.files);
              }}
            >
              <span class="sr-only capitalize">group image</span>
              <span class="icon-[ri--image-circle-fill] h-32 w-32"> </span>
              <span class="text-xs capitalize">limit: 15kb</span>
              <input
                type="file"
                class="hidden"
                accept="image/*"
                onChange={(e) => handleFileInput((e.target as HTMLInputElement | null)?.files)}
              />
            </label>
          )}
        </div>
      </section>

      <section class="flex gap-2">
        <MyButton type="submit" disabled={!isDirty.value} color="green" variant="contained">
          <span class="capitalize">save</span>
        </MyButton>
      </section>
    </form>
  );
});
