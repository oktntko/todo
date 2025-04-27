<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import * as R from 'remeda';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import MyInputFile from '~/component/MyInputFile.vue';
import { useFile } from '~/composable/useFile';
import { useValidate } from '~/composable/useValidate';
import { trpc } from '~/lib/trpc';
import type { z } from '~/lib/zod';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

export type ModelValue = z.infer<typeof TodoRouterSchema.upsertInput> & {
  is_new?: boolean;
  editing?: boolean;
};
export type Reset = (modelValue: ModelValue) => void;

const modelValue = defineModel<ModelValue>({ required: true });
const modelValueFileList = defineModel<DownloadFile[]>('file_list', { required: true });

defineEmits<{
  change: [];
}>();

const props = defineProps<{
  space_id: number;
  order: number;
}>();

const { uploadManyFiles } = useFile();

const { validateSubmit } = useValidate(TodoRouterSchema.upsertInput, modelValue);

const status = ref<{
  fixedEditing: boolean;
  save: '' | 'saving...' | 'saved!';
}>({
  fixedEditing: false,
  save: '',
});
const debounceResetStatus = R.funnel(() => (status.value.save = ''), { minQuietPeriodMs: 1000 });

const handleSubmit = validateSubmit(async (value) => {
  try {
    status.value.save = 'saving...';
    await trpc.todo.upsert.mutate({ ...value, space_id: props.space_id, order: props.order });

    modelValue.value.is_new = false;

    status.value.save = 'saved!';
    debounceResetStatus.call();
  } finally {
    //
  }
});

const debounceHandleSubmit = R.funnel(handleSubmit, { minQuietPeriodMs: 500 });
async function handleInput() {
  // watch だと検索条件を変更したときにwatchが発火してしまう
  // {deep:true} を付けても newとoldの値が一致するので値の変化を取得できない
  // ので @inputイベントを監視して submit を発火する
  debounceHandleSubmit.call();
}

watch(
  () => [
    props.order, // 順番が変わったとき
    modelValue.value.space_id, // ほかのスペースに移動したとき
  ],
  () => {
    debounceHandleSubmit.call();
  },
);
</script>

<template>
  <form
    v-on-click-outside="
      () => {
        if (!status.fixedEditing) {
          modelValue.editing = false;
        }
      }
    "
    class="relative text-sm"
    autocomplete="off"
    @click="modelValue.editing = true"
    @submit.prevent="handleSubmit"
  >
    <div
      v-show="modelValue.editing"
      class="absolute inset-y-0 left-0 flex items-center justify-center"
    >
      <button
        type="button"
        class="todo-handle relative flex cursor-move items-center justify-center"
        title="handle"
      >
        <span class="icon-[radix-icons--drag-handle-dots-2] h-5 w-5"></span>
        <span class="sr-only capitalize">handle</span>
      </button>
    </div>

    <div class="relative flex flex-row gap-2">
      <div class="flex items-start justify-center">
        <button
          v-if="status.save === '' && modelValue.done_at == null"
          type="button"
          class="group relative flex cursor-pointer items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-200 hover:text-green-500"
          title="done"
          @click.prevent="
            async () => {
              modelValue.done_at = new Date();
              $emit('change');
              return handleSubmit();
            }
          "
        >
          <span
            class="icon-[material-symbols--circle-outline] group-hover:icon-[material-symbols--check-circle-outline-rounded] h-5 w-5 group-hover:h-5 group-hover:w-5"
          ></span>
          <span class="sr-only capitalize">done</span>
        </button>
        <button
          v-if="status.save === '' && modelValue.done_at != null"
          type="button"
          class="group relative flex cursor-pointer items-center justify-center rounded-full text-green-500 transition-colors hover:bg-gray-200 hover:text-gray-900"
          title="active"
          @click.prevent="
            async () => {
              modelValue.done_at = null;
              $emit('change');
              return handleSubmit();
            }
          "
        >
          <span
            class="icon-[material-symbols--check-circle-outline-rounded] group-hover:icon-[material-symbols--circle-outline] h-5 w-5 group-hover:h-5 group-hover:w-5"
          ></span>
          <span class="sr-only capitalize">done</span>
        </button>
        <div
          v-if="status.save === 'saving...'"
          class="relative flex items-center justify-center rounded-full transition-colors"
          title="status"
        >
          <span class="icon-[eos-icons--bubble-loading] h-5 w-5 text-gray-500"></span>
          <span class="sr-only capitalize">saving</span>
        </div>
        <div
          v-if="status.save === 'saved!'"
          class="relative flex items-center justify-center rounded-full transition-colors"
          title="status"
        >
          <span class="icon-[bi--brightness-high-fill] h-5 w-5 text-pink-500"></span>
          <span class="sr-only capitalize">saved</span>
        </div>
      </div>

      <div class="relative flex min-w-0 grow flex-col gap-1.5">
        <div class="relative flex flex-row gap-1">
          <input
            v-model="modelValue.title"
            type="text"
            class="block w-full border-b border-b-gray-400 bg-inherit pb-0.5 text-sm font-bold outline-hidden"
            placeholder="Title"
            maxlength="100"
            @input="handleInput"
          />

          <MyDropdown v-show="modelValue.editing">
            <template #button="{ toggle }">
              <button
                type="button"
                class="relative flex cursor-pointer items-center justify-center rounded-full p-0.5 transition-colors hover:bg-gray-200"
                @click="toggle"
              >
                <span class="icon-[bx--menu] h-4 w-4"></span>
                <span class="sr-only capitalize">menu</span>
              </button>
            </template>
            <template #default>
              <ul class="w-48 rounded-sm border border-gray-300 bg-white shadow-md">
                <li>
                  <button
                    type="button"
                    class="group flex w-full cursor-pointer items-center p-2 transition duration-75 hover:bg-gray-200 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100"
                    :disabled="modelValue.is_new"
                    @click="
                      async () => {
                        status.fixedEditing = true;
                        try {
                          const files = await $modal.open<File[]>({
                            component: MyInputFile,
                            componentProps: {
                              multiple: true,
                            },
                          });

                          if (files && files.length > 0) {
                            const { data } = await uploadManyFiles(files, {
                              todo_id: modelValue.todo_id,
                            });

                            modelValueFileList = [...modelValueFileList, ...data];
                          }
                        } finally {
                          status.fixedEditing = false;
                        }
                      }
                    "
                  >
                    <span class="icon-[material-symbols--upload-file] h-4 w-4"></span>
                    <span class="ms-1 capitalize">upload file</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="group flex w-full cursor-pointer items-center p-2 text-yellow-600 transition duration-75 hover:bg-gray-200"
                    @click="
                      async () => {
                        if (!modelValue.is_new) {
                          const yes = await $dialog.confirm(
                            `Do you really want to delete this data?`,
                          );
                          if (!yes) {
                            return;
                          }
                          await trpc.todo.delete.mutate(modelValue);
                        }
                        $emit('change');
                        $toast.success('Todo has been deleted.');
                      }
                    "
                  >
                    <span class="icon-[tabler--trash-filled] h-4 w-4"></span>
                    <span class="ms-1 capitalize">delete todo</span>
                  </button>
                </li>
              </ul>
            </template>
          </MyDropdown>
        </div>

        <div class="flex flex-row items-center justify-start gap-2">
          <div class="flex flex-row gap-2">
            <div>
              <input
                :id="`${modelValue.todo_id}-begin_date`"
                v-model="modelValue.begin_date"
                type="date"
                class="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                @input="handleInput"
              />
            </div>
            <div>
              <input
                :id="`${modelValue.todo_id}-begin_time`"
                v-model="modelValue.begin_time"
                type="time"
                class="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                @input="handleInput"
              />
            </div>
          </div>
          <div>～</div>
          <div class="flex flex-row gap-2">
            <div>
              <input
                :id="`${modelValue.todo_id}-limit_date`"
                v-model="modelValue.limit_date"
                type="date"
                class="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                @input="handleInput"
              />
            </div>
            <div>
              <input
                :id="`${modelValue.todo_id}-limit_time`"
                v-model="modelValue.limit_time"
                type="time"
                class="block border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden sm:text-sm"
                @input="handleInput"
              />
            </div>
          </div>
        </div>

        <div class="text-xs">
          <textarea
            :id="`${modelValue.todo_id}-description`"
            v-model="modelValue.description"
            class="block field-sizing-content w-full border-b border-b-gray-400 bg-inherit pb-0.5 outline-hidden"
            maxlength="400"
            placeholder="Description"
            @input="handleInput"
          ></textarea>
        </div>
      </div>
    </div>
  </form>
</template>
