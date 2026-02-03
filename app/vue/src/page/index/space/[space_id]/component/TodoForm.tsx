import type { z } from '@todo/lib/zod';
import type { JSX } from 'vue/jsx-runtime';

import { TodoRouterSchema } from '@todo/express/schema';
import { useVModel } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { defineComponent, type SlotsType } from 'vue';

import MyButton from '~/component/button/MyButton';
import MyInput from '~/component/input/MyInput.vue';
import MyModalInputFile from '~/component/input/MyModalInputFile.vue';
import MySelect from '~/component/input/MySelect.vue';
import MyTextarea from '~/component/input/MyTextarea.vue';
import MyDownloadFileList, { type DownloadFile } from '~/component/MyDownloadFileList.vue';
import { useFile } from '~/composable/useFile';
import { satisfiesKeys, type EmitsType } from '~/lib/vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useGroupStore } from '~/store/GroupStore';

export type ModelValue = z.input<typeof TodoRouterSchema.createInput>;
type Props = {
  modelValue: ModelValue;
  modelValueFileList: DownloadFile[];
  space_id: string;
  todo_id?: string;
};
const props = satisfiesKeys<Props>()('modelValue', 'modelValueFileList', 'space_id', 'todo_id');

const emits = {
  submit: (_: ModelValue) => true,
  'update:modelValue': (_: ModelValue) => true,
  'update:modelValueFileList': (_: DownloadFile[]) => true,
} satisfies EmitsType;

export type TodoFormSlots = {
  buttons?: () => JSX.Element;
};

export default defineComponent(
  ($props: Props, { emit: $emit, slots: $slots }) => {
    const $dialog = useDialog();

    const { storedGroupList } = storeToRefs(useGroupStore());

    const modelValue = useVModel($props, 'modelValue', $emit);
    const modelValueFileList = useVModel($props, 'modelValueFileList', $emit);

    const { uploadManyFiles } = useFile();

    const { validate, ErrorMessage, isDirty } = useVueValidateZod(
      TodoRouterSchema.createInput,
      modelValue,
    );

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
          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="group_id" class="required text-sm capitalize">
                group
              </label>
            </div>

            <div>
              <MySelect id="group_id" v-model={modelValue.value.group_id} class="flex min-w-60">
                {storedGroupList.value.map((group) => (
                  <option
                    key={group.group_id}
                    value={group.group_id}
                    class={[
                      'border border-gray-300 p-2 transition-colors',
                      'not-first-of-type:border-t-0 not-last-of-type:border-b-0 first-of-type:rounded-t-lg last-of-type:rounded-b-lg',
                      'hover:bg-gray-100',
                      'checked:bg-blue-100 checked:font-bold',
                    ]}
                  >
                    <div class="flex items-center text-sm text-gray-900">
                      {group.group_image ? (
                        <img
                          src={group.group_image}
                          width="16"
                          height="16"
                          decoding="async"
                          class="h-4 w-4 rounded-sm object-cover object-center"
                        />
                      ) : (
                        <span class="icon-[ri--image-circle-fill] h-4 w-4"></span>
                      )}
                      <span class="ms-1">{group.group_name}</span>
                    </div>
                  </option>
                ))}
              </MySelect>
            </div>

            <ErrorMessage class="text-xs text-red-600" field="group_id" />
          </div>

          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="title" class="optional text-sm capitalize">
                title
              </label>
            </div>

            <div>
              <MyInput id="title" v-model={modelValue.value.title} type="text" class="w-full" />
            </div>

            <ErrorMessage class="text-xs text-red-600" field="title" />
          </div>

          <div class="flex flex-row gap-4">
            <div class="flex flex-col gap-0.5">
              <div>
                <label for="begin_date" class="optional text-sm capitalize">
                  begin
                </label>
              </div>

              <div class="flex flex-row gap-2">
                <MyInput
                  id="begin_date"
                  v-model={modelValue.value.begin_date}
                  type="date"
                  max="9999-12-31"
                />
                <MyInput id="begin_time" v-model={modelValue.value.begin_time} type="time" />
              </div>
            </div>
            <div class="flex flex-col gap-0.5">
              <div class="invisible text-sm">～</div>
              <div class="flex grow items-center">～</div>
            </div>
            <div class="flex flex-col gap-0.5">
              <div>
                <label for="limit_date" class="optional text-sm capitalize">
                  limit
                </label>
              </div>

              <div class="flex flex-row gap-2">
                <MyInput
                  id="limit_date"
                  v-model={modelValue.value.limit_date}
                  type="date"
                  max="9999-12-31"
                />
                <MyInput id="limit_time" v-model={modelValue.value.limit_time} type="time" />
              </div>
            </div>
          </div>

          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="description" class="optional text-sm capitalize">
                description
              </label>
            </div>

            <div>
              <MyTextarea
                id="description"
                v-model={modelValue.value.description}
                class="w-full"
                rows="4"
              ></MyTextarea>
            </div>

            <ErrorMessage class="text-xs text-red-600" field="description" />
          </div>

          <div class="flex flex-col gap-0.5">
            <div>
              <label for="file" class="inline-flex items-center gap-2 text-sm capitalize">
                files
                <button
                  id="file"
                  type="button"
                  class={[
                    'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
                    'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
                    'rounded-3xl border p-1',
                    'button-white secondary',
                  ]}
                  disabled={!$props.todo_id}
                  onClick={async () => {
                    const files: File[] = await $dialog.showModal(MyModalInputFile, (resolve) => ({
                      multiple: true,
                      onDone: resolve,
                    }));

                    if (files.length > 0) {
                      const { data } = await uploadManyFiles(files, {
                        space_id: $props.space_id,
                        todo_id: $props.todo_id,
                      });

                      modelValueFileList.value = [...modelValueFileList.value, ...data];
                    }
                  }}
                >
                  <span class="icon-[heroicons-outline--paper-clip] h-4 w-4"></span>
                </button>
              </label>
            </div>
            <MyDownloadFileList
              modelValueFileList={modelValueFileList.value}
              onUpdate:modelValueFileList={(v) => (modelValueFileList.value = v)}
            ></MyDownloadFileList>
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
    slots: {} as SlotsType<TodoFormSlots>,
  },
);
