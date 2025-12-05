<script setup lang="ts">
import type { SelectHTMLAttributes } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props extends /* @vue-ignore */ SelectHTMLAttributes {}

defineProps<Props>();

const modelValue = defineModel<string | number | null>({
  required: true,
});
</script>

<template>
  <select v-model="modelValue" class="relative">
    <button>
      <selectedcontent></selectedcontent>
    </button>

    <slot></slot>
  </select>
</template>

<style scoped>
select,
::picker(select) {
  appearance: base-select;
}

::picker(select) {
  border-radius: 0.5rem;
  border: 0;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px -1px rgb(0 0 0 / 0.1);
}

select::picker-icon {
  color: #6b7280;
}

::picker(select) {
  transform: translateY(-0.5rem);
  opacity: 0;
  transition: all 100ms ease-out;
  transition-behavior: allow-discrete;
}

::picker(select):popover-open {
  transform: translateY(0);
  opacity: 1;
}

@starting-style {
  ::picker(select):popover-open {
    transform: translateY(-0.5rem);
    opacity: 0;
  }
}
</style>
