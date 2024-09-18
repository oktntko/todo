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
  <ul class="flex gap-1.5 flex-row flex-wrap" @click.stop>
    <li
      v-for="(file, i) of file_list"
      :key="file.file_id"
      class="inline-flex text-xs flex-row gap-1 items-center underline hover:bg-gray-100 transition-colors rounded-full px-1"
    >
      <button
        type="button"
        class="inline-flex text-blue-500 items-end gap-0.5 hover:text-blue-800"
        @click="() => downloadSingleFile({ file_id: file.file_id })"
      >
        <span class="icon-[simple-line-icons--cloud-download]"></span>
        <span class>{{ file.filename }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-end hover:bg-gray-300 hover:text-yellow-600 p-0.5 rounded-full transition-colors"
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
