<script setup lang="ts">
import { TodoRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import MyInputFile from '~/component/form/MyInputFile.vue';
import { useFile } from '~/composable/useFile';
import { useSpaceStore } from '~/store/SpaceStore';

export type ModelValue = z.infer<typeof TodoRouterSchema.createInput>;
export type Reset = (modelValue: ModelValue) => void;

const { storedSpaceList } = storeToRefs(useSpaceStore());

const modelValue = defineModel<ModelValue>({ required: true });
const modelValueFileList = defineModel<DownloadFile[]>('file_list', { required: true });

defineProps<{ todo_id?: string }>();

const emit = defineEmits<{
  submit: [ModelValue, Reset];
}>();

const { uploadManyFiles } = useFile();

const { validateSubmit, ErrorMessage, reset, isDirty } = useVueValidateZod(
  TodoRouterSchema.createInput,
  modelValue,
);

const handleSubmit = validateSubmit((value) => {
  emit('submit', value, reset);
});
</script>

<template>
  <form class="flex flex-col gap-6" autocomplete="off" @submit.prevent="handleSubmit">
    <section class="flex flex-col gap-3">
      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="space_id" class="required text-sm capitalize"> space </label>
        </div>

        <div>
          <MySelect
            id="space_id"
            v-model="modelValue.space_id"
            class="flex min-w-60 rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 transition-colors"
          >
            <option
              v-for="space of storedSpaceList"
              :key="space.space_id"
              :value="space.space_id"
              class="border border-gray-300 p-2 transition-colors"
              :class="[
                'not-first-of-type:border-t-0 not-last-of-type:border-b-0 first-of-type:rounded-t-lg last-of-type:rounded-b-lg',
                'hover:bg-gray-100',
                'checked:bg-blue-100 checked:font-bold',
              ]"
            >
              <div class="flex items-center text-sm text-gray-900">
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
              </div>
            </option>
          </MySelect>
        </div>

        <ErrorMessage class="text-xs text-red-600" field="space_id" />
      </div>

      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="title" class="optional text-sm capitalize"> title </label>
        </div>

        <div>
          <input
            id="title"
            v-model.lazy="modelValue.title"
            type="text"
            class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            maxlength="100"
          />
        </div>

        <ErrorMessage class="text-xs text-red-600" field="title" />
      </div>

      <div class="flex flex-row gap-4">
        <div class="flex flex-col gap-0.5">
          <div>
            <label for="begin_date" class="optional text-sm capitalize"> begin </label>
          </div>

          <div class="flex flex-row gap-2">
            <input
              id="begin_date"
              v-model="modelValue.begin_date"
              type="date"
              max="9999-12-31"
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
        <div class="flex flex-col gap-0.5">
          <div class="invisible text-sm">～</div>
          <div class="flex grow items-center">～</div>
        </div>
        <div class="flex flex-col gap-0.5">
          <div>
            <label for="limit_date" class="optional text-sm capitalize"> limit </label>
          </div>

          <div class="flex flex-row gap-2">
            <input
              id="limit_date"
              v-model="modelValue.limit_date"
              type="date"
              max="9999-12-31"
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

      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="description" class="optional text-sm capitalize"> description </label>
        </div>

        <div>
          <textarea
            id="description"
            v-model.lazy="modelValue.description"
            class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            rows="4"
          ></textarea>
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
        </div>
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

<style scoped></style>
