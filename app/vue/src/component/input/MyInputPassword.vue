<script setup lang="ts">
import { ref, type InputHTMLAttributes } from 'vue';

// https://ja.vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance
defineOptions({ inheritAttrs: false });

interface Props extends /* @vue-ignore */ InputHTMLAttributes {}

defineProps<Props>();

const modelValue = defineModel<string>({ default: '' });

const show = ref(false);
</script>

<template>
  <div class="relative">
    <input
      v-bind="{ ...$props, ...$attrs }"
      v-model="modelValue"
      :type="show ? 'text' : 'password'"
      class="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
      :class="[
        $props.class,
        'transition hover:bg-white hover:ring-1 hover:ring-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none',
        'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200 disabled:hover:ring-gray-300 disabled:focus:ring-gray-300',
      ]"
    />
    <div
      class="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-sm leading-5"
      @click="show = !show"
    >
      <span :class="show ? 'icon-[fa6-solid--eye-slash]' : 'icon-[fa6-solid--eye]'"></span>
    </div>
  </div>
</template>
