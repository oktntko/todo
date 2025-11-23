<script setup lang="ts">
const props = defineProps<{
  accept?: string;
  multiple?: boolean;
}>();

const emit = defineEmits<{
  close: [File[] | File | undefined];
}>();

const dragging = ref(false);
</script>

<template>
  <div
    class="flex flex-col items-center justify-center p-4"
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
        emit(
          'close',
          e.dataTransfer?.files
            ? props.multiple
              ? Array.from(e.dataTransfer.files)
              : e.dataTransfer.files[0]
            : undefined,
        );
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
        v-bind="props"
        type="file"
        class="hidden"
        @change="
          (e) => {
            if (e.target) {
              const target = e.target as HTMLInputElement;
              if (target.files && target.files.length) {
                emit('close', props.multiple ? Array.from(target.files) : target.files[0]);
                return;
              }
            }

            emit('close', undefined);
          }
        "
      />
    </label>
  </div>
</template>
