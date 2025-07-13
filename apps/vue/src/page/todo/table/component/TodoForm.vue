<script setup lang="ts">
import { TodoRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import type { SpaceSchema } from '@todo/prisma/schema';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import MyInputFile from '~/component/MyInputFile.vue';
import { useFile } from '~/composable/useFile';
import { useValidate } from '~/composable/useValidate';
import { trpc, type RouterOutput } from '~/lib/trpc';

export type ModelValue = z.infer<typeof TodoRouterSchema.createInput>;
export type Reset = (modelValue: ModelValue) => void;

const modelValue = defineModel<ModelValue>({ required: true });
const modelValueSpace = defineModel<z.infer<typeof SpaceSchema>>('space', { required: false });
const modelValueFileList = defineModel<DownloadFile[]>('file_list', { required: true });

defineProps<{ todo_id?: string }>();

const emit = defineEmits<{
  submit: [ModelValue, Reset];
}>();

const { uploadManyFiles } = useFile();

const { validateSubmit, ErrorMessage, reset, isDirty } = useValidate(
  TodoRouterSchema.createInput,
  modelValue,
);

const handleSubmit = validateSubmit((value) => {
  emit('submit', value, reset);
});

const space_list = ref<RouterOutput['space']['list']['space_list']>([]);
onMounted(async () => {
  const res = await trpc.space.list.query({
    where: { space_keyword: '' },
    sort: { field: 'space_order', order: 'asc' },
  });

  space_list.value = res.space_list;
});
</script>

<template>
  <form class="flex flex-col gap-6" autocomplete="off" @submit.prevent="handleSubmit">
    <section class="flex flex-col gap-2">
      <div class="focus-container flex grow flex-col gap-1">
        <label for="space_id" class="required text-sm capitalize"> space </label>

        <MyDropdown inner-class="w-full">
          <template #button="{ toggle }">
            <button
              id="space_id"
              type="button"
              class="flex w-full flex-row items-center rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
              @click="toggle"
            >
              <template v-if="modelValueSpace">
                <img
                  v-if="modelValueSpace.space_image"
                  :src="modelValueSpace.space_image"
                  width="16"
                  height="16"
                  decoding="async"
                  class="h-4 w-4 rounded-sm object-cover object-center"
                />
                <span v-else class="icon-[ri--image-circle-fill] h-4 w-4"></span>
                <span class="ms-1">{{ modelValueSpace.space_name }}</span>
              </template>
              <span class="invisible capitalize">space</span>
            </button>
          </template>
          <template #default>
            <ul class="w-full rounded-sm border border-gray-300 bg-white shadow-md">
              <li
                v-for="space of space_list"
                :key="space.space_id"
                class="flex cursor-pointer items-center px-1.5 py-1 text-sm hover:bg-gray-100"
                @click="
                  () => {
                    modelValueSpace = space;
                    modelValue.space_id = space.space_id;
                  }
                "
              >
                <img
                  v-if="space.space_image"
                  :src="space.space_image"
                  width="16"
                  height="16"
                  decoding="async"
                  class="h-4 w-4 rounded-sm object-cover object-center"
                />
                <span v-else class="icon-[ri--image-circle-fill] h-4 w-4"></span>
                <span class="ms-1">{{ space.space_name }}</span>
              </li>
            </ul>
          </template>
        </MyDropdown>
        <ErrorMessage class="text-xs text-red-600" for="title" />
      </div>

      <div class="focus-container flex grow flex-col gap-1">
        <label for="title" class="optional text-sm capitalize"> title </label>
        <input
          id="title"
          v-model.lazy="modelValue.title"
          type="text"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          maxlength="100"
        />
        <ErrorMessage class="text-xs text-red-600" for="title" />
      </div>

      <div class="flex flex-row gap-4">
        <div class="flex flex-col gap-1">
          <label for="begin_date" class="optional text-sm capitalize"> begin </label>
          <div class="flex flex-row gap-2">
            <input
              id="begin_date"
              v-model="modelValue.begin_date"
              type="date"
              class="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            />
            <input
              id="begin_time"
              v-model="modelValue.begin_time"
              type="time"
              class="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <div class="invisible text-sm">～</div>
          <div class="flex grow items-center">～</div>
        </div>
        <div class="flex flex-col gap-1">
          <label for="limit_date" class="optional text-sm capitalize"> limit </label>
          <div class="flex flex-row gap-2">
            <input
              id="limit_date"
              v-model="modelValue.limit_date"
              type="date"
              class="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            />
            <input
              id="limit_time"
              v-model="modelValue.limit_time"
              type="time"
              class="rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div class="focus-container flex flex-col gap-1">
        <label for="description" class="optional text-sm capitalize"> description </label>
        <textarea
          id="description"
          v-model.lazy="modelValue.description"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          rows="4"
          maxlength="400"
        ></textarea>

        <ErrorMessage class="text-xs text-red-600" for="description" />
      </div>

      <div class="flex flex-col gap-1">
        <label for="file" class="flex items-center gap-2 text-sm capitalize">
          files
          <button
            type="button"
            :class="[
              'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
              'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
              'rounded-3xl border p-1',
              'button-white secondary',
            ]"
            :disabled="!todo_id"
            @click="
              async () => {
                const files = await $modal.open<File[]>({
                  component: MyInputFile,
                  componentProps: {
                    multiple: true,
                  },
                });

                if (files && files.length > 0) {
                  const { data } = await uploadManyFiles(files, {
                    todo_id,
                  });

                  modelValueFileList = [...modelValueFileList, ...data];
                }
              }
            "
          >
            <span class="icon-[heroicons-outline--paper-clip] h-4 w-4"></span>
          </button>
        </label>
        <MyDownloadFileList v-model:file_list="modelValueFileList"> </MyDownloadFileList>
      </div>
    </section>

    <section class="flex gap-2">
      <button
        type="submit"
        :class="[
          'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
          'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
          'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
          'border-green-700 bg-green-600 text-white hover:bg-green-800',
          'capitalize',
        ]"
        :disabled="!isDirty"
      >
        save
      </button>
      <slot name="buttons"></slot>
    </section>
  </form>
</template>
