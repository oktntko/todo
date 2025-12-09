<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue';

// https://ja.vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance
defineOptions({ inheritAttrs: false });

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props extends /* @vue-ignore */ InputHTMLAttributes {}

defineProps<Props>();

defineEmits<{
  done: [File[]];
  close: [];
}>();

const dragging = ref(false);
</script>

<template>
  <PluginModal class="p-8" @close="$emit('close')">
    <div
      class="flex min-w-lg flex-col items-center justify-center"
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
          $emit('done', Array.from(e.dataTransfer?.files ?? []));
        }
      "
    >
      <label
        :class="[
          'flex h-64 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 px-8 transition-colors hover:bg-gray-200',
          dragging ? 'border-gray-500 bg-gray-200' : '',
        ]"
      >
        <span class="icon-[material-symbols--upload-file] h-12 w-12"> </span>
        <span class="font-semibold">Drag and drop the file, </span>
        <span class="text-xs">or click to select the file.</span>
        <input
          v-bind="$attrs"
          type="file"
          class="hidden"
          @change="
            (e) => {
              $emit('done', Array.from((e.target as HTMLInputElement)?.files ?? []));
            }
          "
        />
      </label>
    </div>
  </PluginModal>
</template>
