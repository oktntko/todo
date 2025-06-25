<script setup lang="ts">
import { MimetypeIcon, MimetypePreview } from '~/component/Mimetype';
import MyInputFile from '~/component/MyInputFile.vue';
import { useFile } from '~/composable/useFile';
import { useValidate } from '~/composable/useValidate';
import { dayjs } from '~/lib/dayjs';
import { trpc, type RouterOutput } from '~/lib/trpc';
import type { z } from '~/lib/zod';
import { FileRouterSchema } from '~/schema/FileRouterSchema';

const { downloadManyFiles, downloadSingleFile, uploadManyFiles } = useFile();

const modelValue = ref<z.infer<typeof FileRouterSchema.searchInput>>({
  where: {
    file_keyword: '',
  },
  sort: {
    field: 'updated_at',
    order: 'desc',
  },
  limit: 50,
  page: 1,
});

const data = ref<{
  total: number;
  file_list: (RouterOutput['file']['search']['file_list'][number] & { checked?: boolean })[];
}>({
  total: 0,
  file_list: [],
});

const loading = ref(true);

const { validateSubmit, ErrorMessage } = useValidate(FileRouterSchema.searchInput, modelValue);
const handleSubmit = validateSubmit(async () => {
  loading.value = true;
  try {
    data.value = await trpc.file.search.query(modelValue.value);
  } finally {
    loading.value = false;
  }
});

onMounted(() => {
  handleSubmit();
});

async function changeSortOrder(field: typeof modelValue.value.sort.field) {
  if (modelValue.value.sort.field !== field) {
    modelValue.value.sort = {
      field: field,
      order: 'asc',
    };
  } else {
    modelValue.value.sort.order = modelValue.value.sort.order === 'asc' ? 'desc' : 'asc';
  }

  return handleSubmit();
}

const checkedList = computed(() => {
  return data.value.file_list.filter((x) => x.checked);
});
const headerCheckbox = computed(() => {
  return {
    checked: checkedList.value.length > 0,
    indeterminate:
      checkedList.value.length > 0 && checkedList.value.length < data.value.file_list.length,
  };
});
</script>

<template>
  <div class="mb-8 flex flex-col gap-6 px-4">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-1 text-lg font-bold">
          <span class="icon-[vaadin--folder-open] h-5 w-5"></span>
          <span class="capitalize">Drive</span>
        </div>
      </div>
    </div>

    <form class="flex flex-col gap-4 px-4" autocomplete="off" @submit.prevent="handleSubmit">
      <section class="flex flex-col gap-2">
        <div class="focus-container flex flex-col gap-1">
          <label for="where.file_keyword" class="optional text-sm capitalize"> keyword </label>
          <input
            id="where.file_keyword"
            v-model.lazy="modelValue.where.file_keyword"
            class="block rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
            maxlength="100"
          />

          <ErrorMessage class="text-xs text-red-600" for="where.file_keyword" />
        </div>
      </section>

      <section class="flex gap-2">
        <button
          type="submit"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-green-700 bg-green-600 text-white hover:bg-green-800',
            'capitalize',
          ]"
          :disabled="loading"
        >
          <span class="icon-[bx--search] h-4 w-4"></span>
          <span class="ms-1 capitalize">search</span>
        </button>
      </section>
    </form>

    <div class="">
      <header
        class="z-10 flex flex-row items-center gap-2 rounded-t border border-gray-300 bg-gray-50 p-2 px-4 py-2 text-sm"
      >
        <button
          type="button"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',

            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-blue-700 bg-white text-blue-700 hover:bg-blue-800 hover:text-white',
            'capitalize',
          ]"
          @click="
            async () => {
              const files = await $modal.open<File[]>({
                component: MyInputFile,
                componentProps: {
                  multiple: true,
                },
              });

              if (files && files.length > 0) {
                await uploadManyFiles(files);

                $toast.success('File have been uploaded.');

                await handleSubmit();
              }
            }
          "
        >
          <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
          <span class="ms-1 capitalize">upload file</span>
        </button>
        <button
          type="button"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-gray-300 bg-white text-gray-800 hover:bg-gray-200',
            'capitalize',
          ]"
          :disabled="loading || checkedList.length === 0"
          @click="
            async () => {
              const file_id_list = checkedList.map((x) => x.file_id);
              if (file_id_list.length === 0) {
                $dialog.alert('There are no files in the checked line.');
                return;
              }

              loading = true;
              try {
                await downloadManyFiles({ file_id_list });
              } finally {
                loading = false;
              }
            }
          "
        >
          <span class="icon-[simple-line-icons--cloud-download] h-4 w-4"></span>
          <span class="ms-1 capitalize">download</span>
        </button>
        <button
          type="button"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-gray-300 bg-white text-gray-800 hover:bg-gray-200',
            'capitalize',
          ]"
          :disabled="loading || checkedList.length === 0"
          @click="
            async () => {
              const yes = await $dialog.confirm(`Do you really want to delete checked data?`);
              if (!yes) {
                return;
              }

              loading = true;
              try {
                await trpc.file.deleteMany.mutate(checkedList);
                $toast.success('File have been deleted.');

                await handleSubmit();
              } finally {
                loading = false;
              }
            }
          "
        >
          <span class="icon-[tabler--trash-filled] h-4 w-4"></span>
          <span class="ms-1 capitalize">delete</span>
        </button>
      </header>

      <table
        class="h-full w-full overflow-x-auto rounded-sm border border-gray-300 bg-gray-50 text-sm"
      >
        <thead class="text-gray-900">
          <tr class="divide-x divide-gray-200">
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              No
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <label class="flex h-full justify-center hover:cursor-pointer">
                <input
                  type="checkbox"
                  class="hover:cursor-pointer"
                  :checked="headerCheckbox.checked"
                  :indeterminate="headerCheckbox.indeterminate"
                  @click="
                    () => {
                      const checked = headerCheckbox.checked;
                      data.file_list.forEach((x) => (x.checked = !checked));
                    }
                  "
                />
              </label>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                filename
                <MySortButton
                  :sort="modelValue.sort"
                  field="filename"
                  @click="changeSortOrder('filename')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                mimetype
                <MySortButton
                  :sort="modelValue.sort"
                  field="mimetype"
                  @click="changeSortOrder('mimetype')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                filesize
                <MySortButton
                  :sort="modelValue.sort"
                  field="filesize"
                  @click="changeSortOrder('filesize')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              todo
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                created
                <MySortButton
                  :sort="modelValue.sort"
                  field="created_at"
                  @click="changeSortOrder('created_at')"
                ></MySortButton>
              </div>
            </th>
            <th
              scope="col"
              :class="[
                'sticky top-[-1px] z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize',
              ]"
            >
              <div class="flex items-center justify-center">
                updated
                <MySortButton
                  :sort="modelValue.sort"
                  field="updated_at"
                  @click="changeSortOrder('updated_at')"
                ></MySortButton>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white text-gray-900">
          <tr
            v-for="(file, i) of data.file_list"
            :key="file.file_id"
            class="divide-x divide-gray-200"
          >
            <td class="max-w-48">
              <button
                class="flex w-full justify-end px-2 py-1 text-right text-blue-600 hover:underline"
                title="download"
                @click="
                  async () => {
                    loading = true;
                    try {
                      await downloadSingleFile({ file_id: file.file_id });
                    } finally {
                      loading = false;
                    }
                  }
                "
              >
                #{{ i + 1 }}
              </button>
            </td>
            <td class="max-w-48">
              <label class="flex h-full justify-center hover:cursor-pointer">
                <input v-model="file.checked" type="checkbox" class="hover:cursor-pointer" />
              </label>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-2 min-w-28 px-2 py-1" :title="file.filename">
                {{ file.filename }}
              </div>
            </td>
            <td class="max-w-48">
              <div
                class="line-clamp-2 flex min-w-28 items-center gap-1 px-2 py-1"
                :title="file.mimetype"
              >
                <span class="h-5 w-5 shrink-0" :class="MimetypeIcon(file)"></span>
                <span class="text-xs text-gray-500">{{ file.mimetype }}</span>
              </div>
              <MimetypePreview v-bind="file"></MimetypePreview>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-2 min-w-28 px-2 py-1 text-right">
                {{
                  file.filesize < 1024
                    ? file.filesize.toLocaleString() + ' bytes'
                    : file.filesize < 1024 * 1024
                      ? (file.filesize / 1024).toLocaleString() + ' KB'
                      : (file.filesize / (1024 * 1024)).toLocaleString() + ' MB'
                }}
              </div>
            </td>
            <td class="max-w-48">
              <div v-for="todo of file.todo_list" :key="todo.todo_id" class="min-w-28 px-2 py-1">
                <RouterLink
                  :to="{
                    name: `/todo/table/[todo_id]`,
                    params: { todo_id: todo.todo_id },
                  }"
                  class="line-clamp-1 break-words whitespace-pre-wrap text-blue-600 hover:underline"
                >
                  {{ todo.title }}
                </RouterLink>
                <div class="line-clamp-4 text-xs break-words whitespace-pre-wrap text-gray-500">
                  {{ todo.description }}
                </div>
              </div>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-1 min-w-32 px-2 py-1">
                {{
                  file.created_at ? dayjs(file.created_at).format('YYYY-MM-DD hh:mm:ss.SSS') : ''
                }}
              </div>
            </td>
            <td class="max-w-48">
              <div class="line-clamp-1 min-w-32 px-2 py-1">
                {{
                  file.updated_at ? dayjs(file.updated_at).format('YYYY-MM-DD hh:mm:ss.SSS') : ''
                }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <footer
        class="sticky bottom-0 z-10 flex flex-row items-center gap-4 rounded-b border border-gray-300 bg-gray-50 px-4 py-2 text-sm"
      >
        <!-- https://www.delldesignsystem.com/components/pagination/ -->
        <div class="flex flex-row items-center gap-2">
          <span class="capitalize">items per page</span>
          <select
            v-model.number="modelValue.limit"
            class="inline-block rounded-sm border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
            :disabled="loading"
            @change="
              () => {
                modelValue.page = 1;
                return handleSubmit();
              }
            "
          >
            <option
              v-for="limit of [10, 50, 100, 200, 500]"
              :key="limit"
              :disabled="limit === modelValue.limit"
            >
              {{ limit }}
            </option>
          </select>
        </div>

        <div class="flex flex-row items-center gap-2">
          <span class="min-w-4 text-right">
            {{ Math.min(data.total, modelValue.limit * (modelValue.page - 1) + 1) }}
          </span>
          -
          <span class="min-w-4 text-right">
            {{ Math.min(data.total, modelValue.limit * modelValue.page) }}
          </span>
          <span> of {{ data.total }} items </span>
        </div>

        <div class="flex flex-row items-center gap-2">
          <div class="relative inline-block">
            <input
              v-model.number="modelValue.page"
              type="range"
              min="1"
              :max="Math.ceil(data.total / modelValue.limit)"
              class="h-2 cursor-pointer rounded-lg bg-gray-200"
              :disabled="loading"
              @change="handleSubmit"
            />
            <span class="absolute end-0 -top-3 text-xs text-gray-500"> max </span>
            <span class="absolute end-0 -bottom-3 text-xs text-gray-500">
              {{ Math.ceil(data.total / modelValue.limit) }}
            </span>
          </div>
          <input
            v-model.number="modelValue.page"
            type="number"
            min="1"
            :max="Math.ceil(data.total / modelValue.limit)"
            step="1"
            class="inline-block rounded-sm border border-gray-300 bg-white px-2 py-1 text-gray-900"
            :disabled="loading"
            @change="handleSubmit"
          />
        </div>
      </footer>
    </div>
  </div>
</template>
