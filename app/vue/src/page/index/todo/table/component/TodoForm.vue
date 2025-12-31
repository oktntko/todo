<script setup lang="ts">
import { TodoRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import MyModalInputFile from '~/component/input/MyModalInputFile.vue';
import { useFile } from '~/composable/useFile';
import { useGroupStore } from '~/store/GroupStore';

export type ModelValue = z.input<typeof TodoRouterSchema.createInput>;
export type Reset = (modelValue: ModelValue) => void;

const { storedGroupList } = storeToRefs(useGroupStore());

const modelValue = defineModel<ModelValue>({ required: true });
const modelValueFileList = defineModel<DownloadFile[]>('file_list', { required: true });

defineProps<{ todo_id?: string }>();

const $emit = defineEmits<{
  submit: [ModelValue, Reset];
}>();

const { uploadManyFiles } = useFile();

const { validateSubmit, ErrorMessage, reset, isDirty } = useVueValidateZod(
  TodoRouterSchema.createInput,
  modelValue,
);

const handleSubmit = validateSubmit((value) => {
  $emit('submit', value, reset);
});
</script>

<template>
  <form class="flex flex-col gap-6" autocomplete="off" @submit.prevent="handleSubmit">
    <section class="flex flex-col gap-3">
      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="group_id" class="required text-sm capitalize"> group </label>
        </div>

        <div>
          <MySelect id="group_id" v-model="modelValue.group_id" class="flex min-w-60">
            <option
              v-for="group of storedGroupList"
              :key="group.group_id"
              :value="group.group_id"
              class="border border-gray-300 p-2 transition-colors"
              :class="[
                'not-first-of-type:border-t-0 not-last-of-type:border-b-0 first-of-type:rounded-t-lg last-of-type:rounded-b-lg',
                'hover:bg-gray-100',
                'checked:bg-blue-100 checked:font-bold',
              ]"
            >
              <div class="flex items-center text-sm text-gray-900">
                <img
                  v-if="group.group_image"
                  :src="group.group_image"
                  width="16"
                  height="16"
                  decoding="async"
                  class="h-4 w-4 rounded-sm object-cover object-center"
                />
                <span v-else class="icon-[ri--image-circle-fill] h-4 w-4"></span>
                <span class="ms-1">{{ group.group_name }}</span>
              </div>
            </option>
          </MySelect>
        </div>

        <ErrorMessage class="text-xs text-red-600" field="group_id" />
      </div>

      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="title" class="optional text-sm capitalize"> title </label>
        </div>

        <div>
          <MyInput id="title" v-model="modelValue.title" type="text" class="w-full" />
        </div>

        <ErrorMessage class="text-xs text-red-600" field="title" />
      </div>

      <div class="flex flex-row gap-4">
        <div class="flex flex-col gap-0.5">
          <div>
            <label for="begin_date" class="optional text-sm capitalize"> begin </label>
          </div>

          <div class="flex flex-row gap-2">
            <MyInput id="begin_date" v-model="modelValue.begin_date" type="date" max="9999-12-31" />
            <MyInput id="begin_time" v-model="modelValue.begin_time" type="time" />
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
            <MyInput id="limit_date" v-model="modelValue.limit_date" type="date" max="9999-12-31" />
            <MyInput id="limit_time" v-model="modelValue.limit_time" type="time" />
          </div>
        </div>
      </div>

      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="description" class="optional text-sm capitalize"> description </label>
        </div>

        <div>
          <MyTextarea
            id="description"
            v-model="modelValue.description"
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
              :class="[
                'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
                'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
                'rounded-3xl border p-1',
                'button-white secondary',
              ]"
              :disabled="!todo_id"
              @click="
                async () => {
                  const files: File[] = await $dialog.showModal(MyModalInputFile, (resolve) => ({
                    multiple: true,
                    onDone: resolve,
                  }));

                  if (files.length > 0) {
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
      <MyButton type="submit" :disabled="!isDirty" color="green" variant="contained">
        <span class="capitalize">save</span>
      </MyButton>
      <slot name="buttons"></slot>
    </section>
  </form>
</template>

<style scoped></style>
