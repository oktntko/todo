<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue';

interface Props extends /* @vue-ignore */ Omit<InputHTMLAttributes, 'type'> {
  type?:
    | 'button'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week'
    | undefined;
}

defineProps<Props>();

const modelValue = defineModel<string | number>({ required: true });
</script>

<template>
  <input
    v-bind="$props"
    v-model="modelValue"
    class="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
    :class="[
      'transition hover:bg-white hover:ring-1 hover:ring-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none',
      'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200 disabled:hover:ring-gray-300 disabled:focus:ring-gray-300',
    ]"
  />
</template>
