<script setup lang="ts">
import type { DownloadFile } from '~/component/type';

import { useFile } from '~/composable/useFile';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

defineEmits<{
  deleted: [number];
}>();

const $dialog = useDialog();
const $toast = useToast();

const modelValueFileList = defineModel<DownloadFile[]>('modelValueFileList', {
  required: false,
  default: () => [],
});

const { downloadSingleFile } = useFile();
</script>

<template>
  <ul class="flex flex-wrap" :class="['flex-col gap-1 lg:flex-row lg:gap-2']" @click.stop>
    <li
      v-for="(file, i) of modelValueFileList"
      :key="file.file_id"
      class="inline-flex flex-row items-center gap-0.5 text-sm"
    >
      <button
        type="button"
        class="inline-flex flex-row items-center gap-0.5 text-blue-600 transition-colors hover:text-blue-800 hover:underline"
        @click="() => downloadSingleFile({ file_id: file.file_id })"
      >
        <span class="icon-[simple-line-icons--cloud-download]"></span>
        <span>{{ file.filename }}</span>
      </button>

      <button
        type="button"
        aria-label="close"
        class="peer inline-flex flex-row items-center rounded-full p-0.5 text-gray-900 transition-colors hover:bg-gray-300"
        @click="
          async () => {
            await $dialog.confirm.warn(`Do you really want to delete this file?
'${file.filename}'`);

            const loading = $dialog.loading();
            try {
              await trpc.file.delete.mutate(file);

              modelValueFileList = modelValueFileList.filter((x) => x.file_id !== file.file_id);

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
