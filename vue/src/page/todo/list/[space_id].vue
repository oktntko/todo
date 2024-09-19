<script setup lang="ts">
import * as R from 'remeda';
import { useValidate } from '~/composable/useValidate';
import { trpc, type RouterOutput } from '~/lib/trpc';
import type { z } from '~/lib/zod';
import TodoForm from '~/page/todo/list/component/TodoForm.vue';
import ModalEditSpace from '~/page/todo/list/modal/ModalEditSpace.vue';
import { TodoRouterSchema } from '~/schema/TodoRouterSchema';

const router = useRouter();
const route = useRoute('/todo/list/[space_id]');

const modelValue = ref<z.infer<typeof TodoRouterSchema.listInput>>({
  where: {
    space_id: null,
    todo_keyword: '',
    todo_status: 'active',
  },
  sort: {
    field: 'order',
    order: 'desc',
  },
});

const space = ref<RouterOutput['space']['get']>();
const todo_list = ref<(RouterOutput['todo']['get'] & { is_new?: boolean; editing?: boolean })[]>(
  [],
);

const loading = ref(true);

const { validateSubmit } = useValidate(TodoRouterSchema.listInput, modelValue);
const handleSubmit = validateSubmit(async () => {
  if (space.value == null) return;

  loading.value = true;
  try {
    const data = await trpc.todo.list.query(modelValue.value);
    todo_list.value = data.todo_list;
  } finally {
    loading.value = false;
  }
});

function createNewEmptyTodo(params: {
  space_id: number;
}): RouterOutput['todo']['get'] & { is_new?: boolean; editing?: boolean } {
  return {
    todo_id: window.crypto.randomUUID(),
    space_id: params.space_id,
    title: '',
    description: '',
    begin_date: '',
    begin_time: '',
    limit_date: '',
    limit_time: '',
    order: 0,
    done_at: null,

    tag_list: [],
    file_list: [],

    created_at: new Date(),
    created_by: 0,
    updated_at: new Date(),
    updated_by: 0,

    is_new: true,
    editing: true,
  };
}

// unplugin-vue-router/data-loaders だと modelValue(検索条件)を引き回すことができない(できるかもしれないけど分からない)
// vue-router onBeforeRouteUpdate だと route の型が不明で params が取得できない
// 地道にwatchで実装する https://router.vuejs.org/guide/essentials/dynamic-matching#Reacting-to-Params-Changes
async function load(params: { space_id: string }) {
  space.value = undefined;
  todo_list.value = [];

  const space_id = Number(params.space_id);
  space.value = await trpc.space.get.query({ space_id });

  modelValue.value.where.space_id = space_id;
  await handleSubmit();
}

onMounted(async () => {
  load(route.params);
});

watch(
  () => route.params.space_id,
  async () => {
    load(route.params);
  },
);

const debounce = R.debounce(handleSubmit, { waitMs: 500 });
</script>

<template>
  <div class="px-4 flex flex-row gap-2 mb-8">
    <Transition
      mode="out-in"
      enter-from-class="transform opacity-0"
      enter-active-class="transition ease-out duration-200"
      enter-to-class="transform opacity-100"
    >
      <div
        v-if="space"
        class="container flex flex-col gap-2 text-sm max-w-2xl self-start bg-white rounded border pb-4 border-gray-300 py-4"
      >
        <div class="flex justify-between px-4">
          <div>
            <div class="flex items-center text-lg font-bold">
              <img
                v-if="space.space_image"
                :src="space.space_image"
                width="24"
                height="24"
                decoding="async"
                class="w-6 h-6 rounded object-cover object-center"
              />
              <span v-else class="icon-[ri--image-circle-fill] w-6 h-6"></span>
              <span class="ms-1">{{ space.space_name }}</span>
            </div>
            <div
              v-if="space.space_description"
              class="ml-4 text-gray-500 text-xs inline-block max-w-full break-words whitespace-pre-wrap"
            >
              {{ space.space_description }}
            </div>
          </div>

          <MyDropdown>
            <template #button="{ toggle }">
              <button
                type="button"
                class="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-200 transition-colors"
                @click="toggle"
              >
                <span class="icon-[bx--menu] h-4 w-4"></span>
                <span class="sr-only capitalize">menu</span>
              </button>
            </template>
            <template #default>
              <ul class="w-48 bg-white rounded border border-gray-300 shadow-md">
                <li>
                  <button
                    type="button"
                    class="flex items-center w-full p-2 transition duration-75 group hover:bg-gray-200 text-blue-600"
                    @click="
                      async () => {
                        if (space == null) return;

                        const updatedSpace = await $modal.open<RouterOutput['space']['update']>({
                          component: ModalEditSpace,
                          componentProps: { space_id: space.space_id },
                        });

                        if (updatedSpace == null) return;

                        space = updatedSpace;
                      }
                    "
                  >
                    <span class="icon-[icon-park-solid--edit] w-4 h-4"></span>
                    <span class="ms-1 capitalize">edit space</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="flex items-center w-full p-2 transition duration-75 group hover:bg-gray-200 text-yellow-600"
                    @click="
                      async () => {
                        if (space == null) return;

                        if (!(await $dialog.confirm('This action cannot be undone. Are you sure?')))
                          return;

                        const loading = $loading.open();
                        try {
                          await trpc.space.delete.mutate({
                            space_id: space.space_id,
                            updated_at: space.updated_at,
                          });

                          router.replace('/todo/list');

                          $toast.success('Data has been deleted.');
                        } finally {
                          loading.close();
                        }
                      }
                    "
                  >
                    <span class="icon-[tabler--trash-filled] w-4 h-4"></span>
                    <span class="ms-1 capitalize">delete space</span>
                  </button>
                </li>
              </ul>
            </template>
          </MyDropdown>
        </div>

        <div class="flex flex-row gap-2 items-center text-sm ps-2 pe-4">
          <button
            type="button"
            class="flex rounded-full items-center py-2 px-4 transition duration-75 group hover:bg-gray-200 text-blue-600"
            @click="
              () => {
                if (space == null) return;

                todo_list.unshift(createNewEmptyTodo({ space_id: space.space_id }));
              }
            "
          >
            <span class="icon-[icon-park-solid--add-one] w-4 h-4"></span>
            <span class="ms-1 capitalize">add todo</span>
          </button>

          <form class="text-sm flex flex-row gap-2 items-center" @submit.prevent="handleSubmit">
            <div class="relative flex flex-row items-center">
              <div class="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">
                <span class="w-4 h-4 text-gray-500 icon-[line-md--filter]"></span>
              </div>
              <input
                v-model="modelValue.where.todo_keyword"
                class="inline-block rounded-s-lg border border-gray-300 bg-white py-1 ps-6 pe-2 w-full text-gray-900"
                maxlength="255"
                @input="() => debounce.call()"
              />
              <button
                type="button"
                class="inline-flex items-center p-1.5 border-y border-e rounded-e-lg border-gray-300 bg-white"
                @click="
                  () => {
                    modelValue.sort.order = modelValue.sort.order === 'desc' ? 'asc' : 'desc';
                    handleSubmit();
                  }
                "
              >
                <span
                  v-if="modelValue.sort.order === 'desc'"
                  class="w-4 h-4 icon-[hugeicons--sorting-01]"
                ></span
                ><span v-else class="w-4 h-4 icon-[hugeicons--sorting-02]"></span>
              </button>
            </div>

            <label
              for="status-active"
              class="flex items-center font-medium text-gray-900 capitalize"
            >
              <input
                id="status-active"
                v-model="modelValue.where.todo_status"
                type="radio"
                value="active"
                class="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                @change="handleSubmit"
              />
              active
            </label>
            <label for="status-done" class="flex items-center font-medium text-gray-900 capitalize">
              <input
                id="status-done"
                v-model="modelValue.where.todo_status"
                type="radio"
                value="done"
                class="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                @change="handleSubmit"
              />
              done
            </label>

            <span
              v-show="loading"
              class="icon-[svg-spinners--3-dots-fade] h-4 w-4 text-gray-600 text-opacity-60 animate-pulse"
            />
          </form>
        </div>

        <ul class="divide-y divide-dotted">
          <li v-for="(todo, i) of todo_list" :key="todo.todo_id">
            <TodoForm
              v-model="todo_list[i]"
              class="px-6 py-2"
              :file_list="todo_list[i].file_list"
              @change="
                () => {
                  todo_list = todo_list.filter((_, index) => index !== i);
                }
              "
            ></TodoForm>
          </li>
        </ul>
      </div>
      <MyLoading v-else class="flex grow flex-col gap-8" />
    </Transition>
  </div>
</template>
