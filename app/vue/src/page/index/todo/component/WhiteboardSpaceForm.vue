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
    <section class="flex flex-col gap-3">
      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="whiteboard_name" class="required text-sm capitalize"> name </label>
        </div>

        <div>
          <MyInput
            id="whiteboard_name"
            v-model.lazy="modelValue.whiteboard_name"
            type="text"
            class="w-full"
            maxlength="100"
            required
          />
        </div>

        <ErrorMessage class="text-xs text-red-600" field="whiteboard_name" />
      </div>

      <div class="focus-container flex flex-col gap-0.5">
        <div>
          <label for="whiteboard_description" class="optional text-sm capitalize">
            description
          </label>
        </div>

        <div>
          <MyTextarea
            id="whiteboard_description"
            v-model.lazy="modelValue.whiteboard_description"
            class="w-full"
            rows="4"
            maxlength="400"
          ></MyTextarea>
        </div>

        <ErrorMessage class="text-xs text-red-600" field="whiteboard_description" />
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
