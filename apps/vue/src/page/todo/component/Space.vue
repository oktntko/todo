<script setup lang="ts">
import { TodoRouterSchema } from '@todo/express/schema';
import { R } from '@todo/lib/remeda';
import type { z } from '@todo/lib/zod';
import Sortable from 'sortablejs';
import { useValidate } from '~/composable/useValidate';
import { trpc, type RouterOutput } from '~/lib/trpc';
import TodoForm from '~/page/todo/component/TodoForm.vue';
import ModalEditSpace from '~/page/todo/modal/ModalEditSpace.vue';

const props = defineProps<{ space: RouterOutput['space']['list']['space_list'][number] }>();
const modelValue = ref<z.infer<typeof TodoRouterSchema.listInput>>({
  space_id: props.space.space_id,
  todo_status: 'active',
});

export type TodoWithStatus = RouterOutput['todo']['get'] & { is_new?: boolean; editing?: boolean };
const emit = defineEmits<{
  add: [callback: (todo: TodoWithStatus) => void];
  remove: [TodoWithStatus];
}>();

const todo_list = ref<TodoWithStatus[]>([]);

const loading = ref(true);

const { validateSubmit } = useValidate(TodoRouterSchema.listInput, modelValue);
const handleSubmit = validateSubmit(async (value) => {
  loading.value = true;
  try {
    todo_list.value = await trpc.todo.list.query(value);
  } finally {
    loading.value = false;
  }
});

function createNewEmptyTodo(): TodoWithStatus {
  return {
    todo_id: window.crypto.randomUUID(),

    space: props.space,
    space_id: props.space.space_id,

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
onMounted(async () => {
  sortable.value?.destroy();

  todo_list.value = [];

  await handleSubmit();

  const el = document.getElementById(`space-${props.space.space_id}-sortable-container`)!;

  sortable.value = Sortable.create(el, {
    animation: 150,
    group: 'todo',
    handle: '.todo-handle',
    chosenClass: 'bg-blue-100',
    dragClass: 'bg-blue-100',

    // Element is dropped into the list from another list
    onAdd(e) {
      // コンテナからコンテナへ移動したとき、
      // add => remove の順にイベントが呼び出される。
      // addイベントに、バインドされているオブジェクトの情報は含まれないため、
      // 親コンポーネントにコールバックを渡し、
      // removeイベントが実行されたらコールバックを呼び出してもらう
      emit('add', async function (todo: TodoWithStatus) {
        if (e.newIndex == null) return;

        todo_list.value.splice(e.newIndex, 0, todo);
        await nextTick(() => {
          // watch で submitを実行するために書き換え
          todo_list.value.forEach((x) => {
            x.space_id = modelValue.value.space_id;
          });
        });
      });
    },

    // Element is removed from the list into another list
    onRemove(e) {
      if (e.oldIndex == null) return;

      emit('remove', todo_list.value[e.oldIndex]);
      todo_list.value.splice(e.oldIndex, 1);
    },

    // Element dragging ended
    onEnd(e) {
      if (e.from !== e.to) {
        // 別のコンテナに移動したときは、 onAdd と onRemove でハンドリングする
        return;
      }
      if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) {
        // 同一コンテナ内でインデックスに変化がないときは、何も操作しない
        return;
      }

      /**
       * todo_list: ['メロン', 'リンゴ', 'イチゴ', 'バナナ'];
       * oldIndex: 1;
       * newIndex: 2;
       */
      const todo = todo_list.value[e.oldIndex]; // todo => 'リンゴ'
      const tail = todo_list.value.slice(e.oldIndex + 1); // tail => ['イチゴ', 'バナナ']

      todo_list.value.splice(e.oldIndex); // todo_list => ['メロン']
      todo_list.value.push(...tail); // todo_list => ['メロン', 'イチゴ', 'バナナ']
      todo_list.value.splice(e.newIndex, 0, todo); // todo_list => ['メロン', 'イチゴ', 'リンゴ', 'バナナ']
    },
  });
});
</script>

<template>
  <div class="rounded-sm border border-gray-300 bg-white pb-4 text-sm shadow-sm">
    <div class="sticky top-0 z-10 bg-white pt-4 pb-2">
      <div class="flex justify-between px-4">
        <div>
          <div class="flex items-center text-lg font-bold">
            <img
              v-if="space.space_image"
              :src="space.space_image"
              width="24"
              height="24"
              decoding="async"
              class="h-6 w-6 rounded-sm object-cover object-center"
            />
            <span v-else class="icon-[ri--image-circle-fill] h-6 w-6"></span>
            <span class="ms-1">{{ space.space_name }}</span>
          </div>
          <div
            v-if="space.space_description"
            class="ml-4 inline-block max-w-full text-xs break-words whitespace-pre-wrap text-gray-500"
          >
            {{ space.space_description }}
          </div>
        </div>

        <MyDropdown>
          <template #button="{ toggle }">
            <button
              type="button"
              class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
              @click="toggle"
            >
              <span class="icon-[bx--menu] h-4 w-4"></span>
              <span class="sr-only capitalize">menu</span>
            </button>
          </template>
          <template #default>
            <ul class="w-48 rounded-sm border border-gray-300 bg-white shadow-md">
              <li>
                <button
                  type="button"
                  class="group flex w-full cursor-pointer items-center p-2 text-blue-600 transition duration-75 hover:bg-gray-200"
                  @click="
                    async () => {
                      if (space == null) return;

                      const updatedSpace = await $modal.open<RouterOutput['space']['update']>({
                        component: ModalEditSpace,
                        componentProps: { space_id: space.space_id },
                      });

                      if (updatedSpace == null) return;

                      // space = updatedSpace;
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
                  class="group flex w-full cursor-pointer items-center p-2 text-yellow-600 transition duration-75 hover:bg-gray-200"
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

                        // TODO 削除後の処理 画面にデータが残る

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

      <div class="flex flex-row items-center gap-2 ps-2 pe-4 text-sm">
        <button
          type="button"
          class="group flex cursor-pointer items-center rounded-full px-4 py-2 text-blue-600 transition duration-75 hover:bg-gray-200"
          @click="
            () => {
              todo_list.unshift(createNewEmptyTodo());
            }
          "
        >
          <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
          <span class="ms-1 capitalize">add todo</span>
        </button>

        <form class="flex flex-row items-center gap-2 text-sm" @submit.prevent="handleSubmit">
          <label
            :for="`${props.space.space_id}-status-active`"
            class="flex items-center font-medium text-gray-900 capitalize"
          >
            <input
              :id="`${props.space.space_id}-status-active`"
              v-model="modelValue.todo_status"
              type="radio"
              value="active"
              class="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
              @change="handleSubmit"
            />
            active
          </label>
          <label
            :for="`${props.space.space_id}-status-done`"
            class="flex items-center font-medium text-gray-900 capitalize"
          >
            <input
              :id="`${props.space.space_id}-status-done`"
              v-model="modelValue.todo_status"
              type="radio"
              value="done"
              class="mr-1 h-4 w-4 border-gray-300 bg-gray-100 text-blue-600"
              @change="handleSubmit"
            />
            done
          </label>

          <span
            v-show="loading"
            class="icon-[svg-spinners--3-dots-fade] text-opacity-60 h-4 w-4 animate-pulse text-gray-600"
          />
        </form>
      </div>
    </div>

    <ul :id="`space-${props.space.space_id}-sortable-container`">
      <li
        v-for="(todo, i) of todo_list"
        :key="todo.todo_id"
        class="transition-colors"
        :class="[todo.editing ? 'bg-blue-100' : 'hover:bg-gray-100']"
      >
        <TodoForm
          v-model="todo_list[i]"
          class="px-4 pt-2 pb-4"
          :file_list="todo_list[i].file_list"
          :space_id="props.space.space_id"
          :order="i"
          @change="
            () => {
              todo_list = todo_list.filter((_, index) => index !== i);
            }
          "
        ></TodoForm>
      </li>
      <div v-if="!loading && todo_list.length === 0" class="my-6 w-full text-center">
        <div class="icon-[game-icons--night-sleep] h-12 w-12 bg-green-600 rtl:rotate-180"></div>
        <div class="text-green-600">Nothing ToDo!</div>
      </div>
    </ul>
  </div>
</template>
