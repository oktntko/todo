<script setup lang="tsx">
import { FileRouterSchema } from '@todo/express/schema';
import { dayjs } from '@todo/lib/dayjs';
import type { z } from '@todo/lib/zod';
import { useVueValidateZod } from 'use-vue-validate-schema/zod';
import MyModalInputFile from '~/component/input/MyModalInputFile.vue';
import { useFile } from '~/composable/useFile';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { useModal } from '~/plugin/ModalPlugin';
import { useToast } from '~/plugin/ToastPlugin';

const $modal = useModal();
const $toast = useToast();

function MimetypeIcon({ mimetype }: { mimetype: string }) {
  // https://www.iana.org/assignments/media-types/media-types.xhtml
  if (mimetype.startsWith('application')) {
    switch (mimetype) {
      // cSpell:ignore msword openxmlformats officedocument wordprocessingml spreadsheetml presentationml
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'icon-[vscode-icons--file-type-word]';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'icon-[vscode-icons--file-type-excel]';
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'icon-[vscode-icons--file-type-powerpoint]';
      case 'application/pdf':
        return 'icon-[vscode-icons--file-type-pdf2]';
      case 'application/zip':
      case 'application/x-zip-compressed':
        return 'icon-[vscode-icons--file-type-zip]';
      default:
        return 'icon-[vscode-icons--default-file]';
    }
  } else if (mimetype.startsWith('audio')) {
    return 'icon-[vscode-icons--file-type-audio]';
  } else if (mimetype.startsWith('example')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('font')) {
    return 'icon-[vscode-icons--file-type-font]';
  } else if (mimetype.startsWith('haptics')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('image')) {
    return 'icon-[vscode-icons--file-type-image]';
  } else if (mimetype.startsWith('message')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('model')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('multipart')) {
    return 'icon-[vscode-icons--default-file]';
  } else if (mimetype.startsWith('text')) {
    return 'icon-[vscode-icons--file-type-text]';
  } else if (mimetype.startsWith('video')) {
    return 'icon-[vscode-icons--file-type-video]';
  } else {
    return 'icon-[vscode-icons--default-file]';
  }
}

type MimetypePreviewProps = {
  file_id: string;
  mimetype: string;
};

function MimetypePreview({ file_id, mimetype }: MimetypePreviewProps) {
  if (mimetype.startsWith('application')) {
    return '';
  } else if (mimetype.startsWith('audio')) {
    return (
      <audio
        controls
        src={`${import.meta.env.BASE_URL}api/file/download/single/${file_id}`}
      ></audio>
    );
  } else if (mimetype.startsWith('image')) {
    return <img src={`${import.meta.env.BASE_URL}api/file/download/single/${file_id}`} />;
  } else if (mimetype.startsWith('video')) {
    return (
      <video controls>
        <source
          src={`${import.meta.env.BASE_URL}api/file/download/single/${file_id}`}
          type={mimetype}
        />
      </video>
    );
  } else {
    return <></>;
  }
}

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

const { validateSubmit, ErrorMessage } = useVueValidateZod(
  FileRouterSchema.searchInput,
  modelValue,
);
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

async function handleUpload() {
  const files: File[] = await $modal.showModal(MyModalInputFile, (resolve) => ({
    multiple: true,
    onDone: resolve,
  }));

  if (files.length > 0) {
    await uploadManyFiles(files);

    $toast.success('File have been uploaded.');

    await handleSubmit();
  }
}
</script>

<template>
  <div class="mb-8 flex flex-col gap-4 px-4">
    <div>
      <nav aria-label="Breadcrumb">
        <MyBreadcrumb class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <RouterLink
            :to="{
              name: '//drive/',
            }"
            class="inline-flex items-center gap-0.5 text-sm font-medium text-gray-900"
          >
            <span class="icon-[vaadin--folder-open] h-3 w-3 transition duration-75"> </span>
            <span class="capitalize">drive</span>
          </RouterLink>
        </MyBreadcrumb>
      </nav>
    </div>

    <div>
      <form class="flex flex-col gap-6" autocomplete="off" @submit.prevent="handleSubmit">
        <section class="flex flex-col gap-3">
          <div class="focus-container flex flex-col gap-0.5">
            <div>
              <label for="where.file_keyword" class="optional text-sm capitalize"> keyword </label>
            </div>

            <div>
              <input
                id="where.file_keyword"
                v-model.lazy="modelValue.where.file_keyword"
                class="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 sm:text-sm"
                maxlength="100"
              />
            </div>

            <ErrorMessage class="text-xs text-red-600" field="where.file_keyword" />
          </div>
        </section>

        <section class="flex gap-2">
          <MyButton type="submit" color="green" variant="contained" :disabled="loading">
            <span class="icon-[bx--search] h-4 w-4"></span>
            <span class="capitalize">search</span>
          </MyButton>
        </section>
      </form>
    </div>

    <div class="">
      <header
        class="z-10 flex flex-row items-center gap-2 rounded-t border border-gray-300 bg-gray-50 p-2 px-4 py-2 text-sm"
      >
        <MyButton type="button" color="blue" variant="outlined" @click="handleUpload">
          <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
          <span class="capitalize">upload file</span>
        </MyButton>
        <MyButton
          type="button"
          :disabled="loading || checkedList.length === 0"
          @click="
            async () => {
              const file_id_list = checkedList.map((x) => x.file_id);
              if (file_id_list.length === 0) {
                return $modal.alert.info('There are no files in the checked line.');
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
          <span class="capitalize">download</span>
        </MyButton>
        <MyButton
          type="button"
          :disabled="loading || checkedList.length === 0"
          @click="
            async () => {
              await $modal.confirm.warn(`Do you really want to delete checked data?`);

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
          <span class="capitalize">delete</span>
        </MyButton>
      </header>

      <table
        class="h-full w-full overflow-x-auto rounded-sm border border-gray-300 bg-gray-50 text-sm"
      >
        <thead class="text-gray-900">
          <tr class="divide-x divide-gray-200">
            <th
              scope="col"
              :class="['sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize']"
            >
              No
            </th>
            <th
              scope="col"
              :class="['sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize']"
            >
              <label class="flex h-full justify-center hover:cursor-pointer">
                <input
                  type="checkbox"
                  name="header-checkbox"
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
              :class="['sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize']"
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
              :class="['sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize']"
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
              :class="['sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize']"
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
              :class="['sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize']"
            >
              todo
            </th>
            <th
              scope="col"
              :class="['sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize']"
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
              :class="['sticky -top-px z-10 resize-x overflow-x-hidden bg-gray-300 p-2 capitalize']"
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
                <input
                  v-model="file.checked"
                  name="row-checkbox"
                  type="checkbox"
                  class="hover:cursor-pointer"
                />
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
                    name: `//todo/table/[todo_id]`,
                    params: {
                      todo_id: todo.todo_id,
                    },
                  }"
                  class="line-clamp-1 wrap-break-word whitespace-pre-wrap text-blue-600 hover:underline"
                >
                  {{ todo.title }}
                </RouterLink>
                <div class="line-clamp-4 text-xs wrap-break-word whitespace-pre-wrap text-gray-500">
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
            name="limit"
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
              name="page"
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
            name="page"
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
