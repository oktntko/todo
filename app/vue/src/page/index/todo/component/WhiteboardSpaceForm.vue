<script setup lang="ts">
import { WhiteboardRouterSchema } from '@todo/express/schema';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';

export type ModelValue = z.infer<typeof WhiteboardRouterSchema.createInput>;
export type Reset = (modelValue: ModelValue) => void;

const $emit = defineEmits<{
  submit: [ModelValue, Reset];
}>();

const modelValue = defineModel<ModelValue>({ required: true });

const { validateSubmit, ErrorMessage, reset, isDirty } = useVueValidateZod(
  WhiteboardRouterSchema.createInput,
  modelValue,
);

const handleSubmit = validateSubmit(async () => {
  $emit('submit', modelValue.value, reset);
});
</script>

<template>
  <form class="flex flex-col gap-6" autocomplete="off" @submit.prevent="handleSubmit">
    <section class="flex flex-col gap-2">
      <div class="focus-container flex flex-col gap-1">
        <label for="whiteboard_name" class="required text-sm capitalize"> name </label>
        <input
          id="whiteboard_name"
          v-model.lazy="modelValue.whiteboard_name"
          type="text"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          maxlength="100"
          required
        />
        <ErrorMessage class="text-xs text-red-600" field="whiteboard_name" />
      </div>

      <div class="focus-container flex flex-col gap-1">
        <label for="whiteboard_description" class="optional text-sm capitalize">
          description
        </label>
        <textarea
          id="whiteboard_description"
          v-model.lazy="modelValue.whiteboard_description"
          class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
          rows="4"
          maxlength="400"
        ></textarea>

        <ErrorMessage class="text-xs text-red-600" field="whiteboard_description" />
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
