import { GroupRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVModel } from '@vueuse/core';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, ref, type SlotsType } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import MyButton from '~/component/button/MyButton';
import MyInput from '~/component/input/MyInput.vue';
import MyTextarea from '~/component/input/MyTextarea.vue';
import { bytesToBase64 } from '~/lib/file';
import { satisfiesKeys, type EmitsType } from '~/lib/vue';
import { useDialog } from '~/plugin/DialogPlugin';

export type ModelValue = z.infer<typeof GroupRouterSchema.createInput>;
type Props = {
  modelValue: ModelValue;
};
const props = satisfiesKeys<Props>()('modelValue');

const emits = {
  submit: (_: ModelValue) => true,
  'update:modelValue': (_: ModelValue) => true,
} satisfies EmitsType;

export type GroupFormSlots = {
  buttons?: () => JSX.Element;
};

export default defineComponent(
  ($props: Props, { emit: $emit, slots: $slots }) => {
    const $dialog = useDialog();

    const modelValue = useVModel($props, 'modelValue', $emit);

    const { validate, ErrorMessage, isDirty } = useVueValidateZod(
      GroupRouterSchema.createInput,
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

      modelValue.value.group_image = await bytesToBase64(file);
    }

    return () => (
      <form
        class="flex flex-col gap-6"
        autocomplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          const result = await validate();
          if (!result.success) return;

          $emit('submit', result.data);
        }}
      >
        <section class="flex flex-col gap-3">
          <div class="flex gap-6">
            <div class="flex items-start">
              {modelValue.value.group_image ? (
                // 画像があるとき
                <div class="relative h-16 w-16">
                  <img
                    src={modelValue.value.group_image}
                    width="64"
                    height="64"
                    decoding="async"
                    class="h-16 w-16 rounded-sm object-cover object-center"
                    alt="group image"
                  />
                  <button
                    type="button"
                    class="absolute -top-2 -right-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 transition-colors hover:bg-gray-200"
                    aria-label="Close"
                    onClick={() => (modelValue.value.group_image = '')}
                  >
                    <span class="icon-[bi--x] h-4 w-4" />
                  </button>
                </div>
              ) : (
                // 画像がないとき
                <label
                  class={[
                    'relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border-2 border-dashed border-gray-300 bg-gray-100 px-1 text-center text-gray-400 transition-colors hover:bg-gray-200',
                    dragging.value ? 'border-gray-500 bg-gray-200' : '',
                  ]}
                  onDragenter={() => (dragging.value = true)}
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
                  onDragover={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    dragging.value = false;
                    handleFileInput(e.dataTransfer?.files);
                  }}
                >
                  <span class="sr-only capitalize">group image</span>
                  <span class="icon-[ri--image-circle-fill] h-4 w-4"> </span>
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

            <div class="focus-container flex flex-col gap-0.5">
              <div>
                <label for="group_name" class="required text-sm capitalize">
                  name
                </label>
              </div>

              <div>
                <MyInput
                  id="group_name"
                  v-model={modelValue.value.group_name}
                  type="text"
                  class="w-full"
                  maxlength="100"
                  required
                />
              </div>

              <ErrorMessage class="text-xs text-red-600" field="group_name" />
            </div>

            <div class="focus-container flex flex-col gap-0.5">
              <div>
                <label for="group_color" class="text-sm capitalize">
                  color
                </label>
              </div>

              <div class="grow">
                <MyInput
                  id="group_color"
                  v-model={modelValue.value.group_color}
                  list="color-picker"
                  type="color"
                  class="h-full w-16 p-1!"
                />
              </div>

              <ErrorMessage class="text-xs text-red-600" field="group_color" />
            </div>
          </div>

          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="group_description" class="optional text-sm capitalize">
                description
              </label>
            </div>

            <div>
              <MyTextarea
                id="group_description"
                v-model={modelValue.value.group_description}
                class="w-full"
                rows="4"
                maxlength="400"
              ></MyTextarea>
            </div>

            <ErrorMessage class="text-xs text-red-600" field="group_description" />
          </div>
        </section>

        <section class="flex gap-2">
          <MyButton type="submit" disabled={!isDirty.value} color="green" variant="contained">
            <span class="capitalize">save</span>
          </MyButton>

          {$slots.buttons?.()}
        </section>
      </form>
    );
  },
  {
    props,
    emits,
    slots: {} as SlotsType<GroupFormSlots>,
  },
);
