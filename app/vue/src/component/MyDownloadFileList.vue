<script setup lang="ts">
import { useFile } from '~/composable/useFile';
import { trpc } from '~/lib/trpc';

export type DownloadFile = {
  file_id: string;
  filename: string;
  updated_at: Date;
};

defineEmits<{
  deleted: [number];
}>();

const file_list = defineModel<DownloadFile[]>('file_list', {
  required: false,
  default: () => [],
});

const { downloadSingleFile } = useFile();
</script>

<template>
  <ul class="flex flex-wrap" :class="['flex-col gap-1 lg:flex-row lg:gap-2']" @click.stop>
    <li
      v-for="(file, i) of file_list"
      :key="file.file_id"
      class="inline-flex flex-row items-center gap-0.5 text-sm"
    >
      <button
        type="button"
        class="inline-flex flex-row items-center gap-0.5 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
        @click="() => downloadSingleFile({ file_id: file.file_id })"
      >
        <span class="icon-[simple-line-icons--cloud-download]"></span>
        <span class>{{ file.filename }}</span>
      </button>

      <button
        type="button"
        aria-label="close"
        class="peer inline-flex flex-row items-center rounded-full p-0.5 text-gray-900 transition-colors hover:bg-gray-300"
        @click="
          async () => {
            const yes = await $dialog.confirm(
              `Do you really want to delete this file?
'${file.filename}'`,
            );
            if (!yes) return;

            const loading = $loading.open();
            try {
              await trpc.file.delete.mutate(file);

              file_list = file_list.filter((x) => x.file_id !== file.file_id);

              $emit('deleted', i);
              $toast.success('Data has been deleted.');
            } finally {
              loading.close();
            }
          }
        "
      >
        <span class="icon-[bi--x] h-4 w-4" />
      </button>
    </li>
  </ul>
</template>
