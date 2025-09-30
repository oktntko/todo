<script setup lang="ts">
import { SpaceRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import { bytesToBase64 } from '~/lib/file';
import { useDialog } from '~/plugin/DialogPlugin';

export type ModelValue = z.infer<typeof SpaceRouterSchema.createInput>;
export type Reset = (modelValue: ModelValue) => void;

const $dialog = useDialog();

const emit = defineEmits<{
  submit: [ModelValue, Reset];
}>();

const modelValue = defineModel<ModelValue>({ required: true });

const { validateSubmit, ErrorMessage, reset, isDirty } = useVueValidateZod(
  SpaceRouterSchema.createInput,
  modelValue,
);

const handleSubmit = validateSubmit(async () => {
  emit('submit', modelValue.value, reset);
});

const dragging = ref(false);

async function handleFileInput(files?: FileList | null) {
  if (files == null || files.length === 0) {
    return;
  }

  const file = files[0]!;

  if (!file.type.startsWith('image/')) {
    $dialog.alert('Choose a IMAGE file.');
    return;
  }

  if (file.size > 1024 * 15 /* 15kb */) {
    // MySQL TEXT 最大 65,535 バイト BASE64エンコードで約3倍になる
    // 65,535 / 4 = 16383.75 バイト ≒ 15.9kb => 15kb
    $dialog.alert('The upper limit is 15kb.');
    return;
  }

  modelValue.value.space_image = await bytesToBase64(file);
}
</script>

<template>
  <form class="flex flex-col gap-6" autocomplete="off" @submit.prevent="handleSubmit">
    <section class="flex flex-col gap-2">
      <div class="flex gap-6">
        <div class="flex items-start">
          <!-- 画像があるとき -->
          <div v-if="modelValue.space_image" class="relative h-16 w-16">
            <img
              :src="modelValue.space_image"
              width="64"
              height="64"
              decoding="async"
              class="h-16 w-16 rounded-sm object-cover object-center"
              alt="space image"
            />
            <button
              type="button"
              class="absolute top-[-8px] right-[-8px] flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-900 transition-colors hover:bg-gray-200"
              aria-label="Close"
              @click="modelValue.space_image = ''"
            >
              <span class="icon-[bi--x] h-4 w-4" />
            </button>
          </div>

          <!-- 画像がないとき -->
          <label
            v-else
            :class="[
              'relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-sm border-2 border-dashed border-gray-300 bg-gray-100 px-1 text-center text-gray-400 transition-colors hover:bg-gray-200',
              dragging ? 'border-gray-500 bg-gray-200' : '',
            ]"
            @dragenter="dragging = true"
            @dragleave="
              (e) => {
                // 子要素へ dragenter すると自身の dragleave が発火するため、子要素かどうか判定する
                // https://qiita.com/keiliving/items/5e8b26e6567efbc15765
                if (e.relatedTarget && e.currentTarget) {
                  const currentTarget = e.currentTarget as Node;
                  const relatedTarget = e.relatedTarget as Node;
                  if (currentTarget.contains(relatedTarget)) {
                    return;
                  }
                }

                dragging = false;
              }
            "
            @dragover.prevent
            @drop.prevent="
              (e) => {
                dragging = false;
                handleFileInput(e.dataTransfer?.files);
              }
            "
          >
            <span class="sr-only capitalize">space image</span>
            <span class="icon-[ri--image-circle-fill] h-4 w-4"> </span>
            <span class="text-xs capitalize">limit: 15kb</span>
            <input
              type="file"
              class="hidden"
              accept="image/*"
              @change="(e) => handleFileInput((e.target as HTMLInputElement | null)?.files)"
            />
          </label>
        </div>

        <div class="focus-container flex grow flex-col gap-1">
          <label for="space_name" class="required text-sm capitalize"> name </label>
          <input
            id="space_name"
            v-model.lazy="modelValue.space_name"
            type="text"
            class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            maxlength="100"
            required
          />
          <ErrorMessage class="text-xs text-red-600" field="space_name" />
        </div>

        <div class="focus-container flex flex-col gap-1">
          <label for="space_color" class="text-sm capitalize"> color </label>
          <input
            id="space_color"
            v-model.lazy="modelValue.space_color"
            list="color-picker"
            type="color"
            class="block h-full w-16 rounded-lg border border-gray-300 bg-white p-1 text-gray-900 sm:text-sm"
          />
          <datalist id="color-picker">
            <option value="#FF0000" title="red"></option>
            <option value="#00FF00" title="green"></option>
            <option value="#0000FF" title="blue"></option>
            <option value="#FFFF00" title="yellow"></option>
            <option value="#FF00FF" title="purple"></option>
            <option value="#00FFFF" title="aqua"></option>
            <option value="#FFFFFF" title="white"></option>
            <option value="#000000" title="black"></option>
          </datalist>
          <ErrorMessage class="text-xs text-red-600" field="space_color" />
        </div>
      </div>

      <div class="focus-container flex flex-col gap-1">
        <label for="space_description" class="optional text-sm capitalize"> description </label>
        <textarea
          id="space_description"
          v-model.lazy="modelValue.space_description"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          rows="4"
          maxlength="400"
        ></textarea>

        <ErrorMessage class="text-xs text-red-600" field="space_description" />
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
