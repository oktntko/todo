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

defineProps<{
  file_list: DownloadFile[];
}>();

const { downloadSingleFile } = useFile();
</script>

<template>
  <ul class="flex flex-row flex-wrap gap-1.5" @click.stop>
    <li
      v-for="(file, i) of file_list"
      :key="file.file_id"
      class="inline-flex flex-row items-center gap-1 rounded-full px-1 text-xs underline transition-colors hover:bg-gray-100"
    >
      <button
        type="button"
        class="inline-flex items-end gap-0.5 text-blue-500 hover:text-blue-800"
        @click="() => downloadSingleFile({ file_id: file.file_id })"
      >
        <span class="icon-[simple-line-icons--cloud-download]"></span>
        <span class>{{ file.filename }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-end rounded-full p-0.5 transition-colors hover:bg-gray-300 hover:text-yellow-600"
        @click="
          async () => {
            const yes = await $dialog.confirm(
              `Do you really want to delete this file?
'${file.filename}'`,
            );
            if (yes) {
              const loading = $loading.open();
              try {
                await trpc.file.delete.mutate(file);

                $emit('deleted', i);
                $toast.success('Data has been deleted.');
              } finally {
                loading.close();
              }
            }
          }
        "
      >
        <span class="icon-[bi--x]" />
      </button>
    </li>
  </ul>
</template>
