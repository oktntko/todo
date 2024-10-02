<script setup lang="ts">
import * as R from 'remeda';
import Sortable from 'sortablejs';
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
    todo_status: ['active'],
  },
  sort: {
    field: 'order',
    order: 'asc',
  },
});

const space = ref<RouterOutput['space']['get']>();
const todo_list = ref<(RouterOutput['todo']['get'] & { is_new?: boolean; editing?: boolean })[]>(
  [],
);

const loading = ref(true);

const { validateSubmit } = useValidate(TodoRouterSchema.listInput, modelValue);
const handleSubmit = validateSubmit(async () => {
  loading.value = true;
  try {
    const data = await trpc.todo.list.query(modelValue.value);
    todo_list.value = data.todo_list;
  } finally {
    loading.value = false;
  }
});

function createNewEmptyTodo(params: {
  space: RouterOutput['space']['get'];
}): RouterOutput['todo']['get'] & { is_new?: boolean; editing?: boolean } {
  return {
    todo_id: window.crypto.randomUUID(),

    space: params.space,
    space_id: params.space.space_id,

    title: '',
    description: '',
    begin_date: '',
    begin_time: '',
    limit_date: '',
    limit_time: '',
    order:
      (R.firstBy(
        todo_list.value.map((x) => x.order),
        [(x) => x, 'desc'],
      ) ?? -1) + 1,
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

const sortable = ref<Sortable>();
// unplugin-vue-router/data-loaders だと modelValue(検索条件)を引き回すことができない(できるかもしれないけど分からない)
// vue-router onBeforeRouteUpdate だと route の型が不明で params が取得できない
// 地道にwatchで実装する https://router.vuejs.org/guide/essentials/dynamic-matching#Reacting-to-Params-Changes
async function load(params: { space_id: string }) {
  sortable.value?.destroy();

  space.value = undefined;
  todo_list.value = [];

  const space_id = Number(params.space_id);
  space.value = await trpc.space.get.query({ space_id });

  modelValue.value.where.space_id = space_id;
  await handleSubmit();

  await nextTick();
  const el = document.getElementById('sortable-container')!;

  sortable.value = Sortable.create(el, {
    animation: 150,
    handle: '.my-handle',
    chosenClass: 'chosenClass',
    dragClass: 'dragClass',

    onEnd(e) {
      if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) return;

      const todo = todo_list.value[e.oldIndex];
      const tail = todo_list.value.slice(e.oldIndex + 1);

      todo_list.value.splice(e.oldIndex);
      todo_list.value.push(...tail);
      todo_list.value.splice(e.newIndex, 0, todo);
    },
  });
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
</script>

<template>
  <div class="mb-8 flex flex-row gap-2 px-4">
    <Transition
      mode="out-in"
      enter-from-class="transform opacity-0"
      enter-active-class="transition ease-out duration-200"
      enter-to-class="transform opacity-100"
    >
      <div
        v-if="space"
        class="container flex max-w-2xl flex-col gap-2 self-start rounded border border-gray-300 bg-white py-4 pb-4 text-sm shadow"
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
                class="h-6 w-6 rounded object-cover object-center"
              />
              <span v-else class="icon-[ri--image-circle-fill] h-6 w-6"></span>
              <span class="ms-1">{{ space.space_name }}</span>
            </div>
            <div
              v-if="space.space_description"
              class="ml-4 inline-block max-w-full whitespace-pre-wrap break-words text-xs text-gray-500"
            >
              {{ space.space_description }}
            </div>
          </div>

          <MyDropdown>
            <template #button="{ toggle }">
              <button
                type="button"
                class="flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
                @click="toggle"
              >
                <span class="icon-[bx--menu] h-4 w-4"></span>
                <span class="sr-only capitalize">menu</span>
              </button>
            </template>
            <template #default>
              <ul class="w-48 rounded border border-gray-300 bg-white shadow-md">
                <li>
                  <button
                    type="button"
                    class="group flex w-full items-center p-2 text-blue-600 transition duration-75 hover:bg-gray-200"
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
                    <span class="icon-[icon-park-solid--edit] h-4 w-4"></span>
                    <span class="ms-1 capitalize">edit space</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="group flex w-full items-center p-2 text-yellow-600 transition duration-75 hover:bg-gray-200"
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
                    <span class="icon-[tabler--trash-filled] h-4 w-4"></span>
                    <span class="ms-1 capitalize">delete space</span>
                  </button>
                </li>
              </ul>
            </template>
          </MyDropdown>
        </div>

        <div class="flex flex-row items-center gap-2 pe-4 ps-2 text-sm">
          <button
            type="button"
            class="group flex items-center rounded-full px-4 py-2 text-blue-600 transition duration-75 hover:bg-gray-200"
            @click="
              () => {
                if (space == null) return;

                todo_list.unshift(createNewEmptyTodo({ space }));
              }
            "
          >
            <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
            <span class="ms-1 capitalize">add todo</span>
          </button>

          <form class="flex flex-row items-center gap-2 text-sm" @submit.prevent="handleSubmit">
            <label
              for="status-active"
              class="flex items-center font-medium capitalize text-gray-900"
            >
              <input
                id="status-active"
                v-model="modelValue.where.todo_status"
                type="radio"
                :value="['active']"
                class="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                @change="handleSubmit"
              />
              active
            </label>
            <label for="status-done" class="flex items-center font-medium capitalize text-gray-900">
              <input
                id="status-done"
                v-model="modelValue.where.todo_status"
                type="radio"
                :value="['done']"
                class="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
                @change="handleSubmit"
              />
              done
            </label>

            <span
              v-show="loading"
              class="icon-[svg-spinners--3-dots-fade] h-4 w-4 animate-pulse text-gray-600 text-opacity-60"
            />
          </form>
        </div>

        <ul id="sortable-container">
          <li
            v-for="(todo, i) of todo_list"
            :key="todo.todo_id"
            class="hover:bg-gray-100"
            :class="{ 'bg-gray-100': todo.editing }"
          >
            <TodoForm
              v-model="todo_list[i]"
              class="px-6 py-2"
              :file_list="todo_list[i].file_list"
              :order="i"
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

<style lang="postcss" scoped>
.chosenClass {
  @apply bg-blue-100;
}
.dragClass {
  @apply bg-blue-100;
}
</style>
