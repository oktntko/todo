import { R } from '@todo/lib/remeda';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import TodoForm, { type ModelValue } from '../component/TodoForm.vue';

export type ModalEditTodoResult =
  | { event: 'update'; todo: RouterOutput['todo']['update'] }
  | { event: 'delete'; todo: RouterOutput['todo']['delete'] };

const $emit = defineEmits<{
  done: [ModalEditTodoResult];
}>();

const $toast = useToast();
const $dialog = useDialog();

const props = defineProps<{
  space_id: string;
  todo_id: string;
}>();

const todo = await trpc.todo.get.query({ todo_id: props.todo_id });

const modelValue = ref<ModelValue>(R.omit(todo, ['file_list', 'group']));
const modelValueFileList = ref<DownloadFile[]>(todo.file_list);
const updated_at = todo.updated_at;

async function handleSubmit(input: ModelValue) {
  const loading = $dialog.loading();
  try {
    const todo = await trpc.todo.update.mutate({
      ...input,
      todo_id: props.todo_id,
      updated_at,
    });

    $toast.success('Todo has been saved.');

    $emit('done', { event: 'update', todo });
  } finally {
    loading.close();
  }
}

(
  <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
    <header class="mb-4 text-lg font-bold capitalize">edit todo</header>
    <TodoForm
      v-model="modelValue"
      v-model:file_list="modelValueFileList"
      :space_id="space_id"
      :todo_id="todo_id"
      @submit="handleSubmit"
    >
      <template #buttons>
        <MyButton
          type="button"
          color="yellow"
          variant="outlined"
          @click="
            async () => {
              await $dialog.confirm.warn(`Do you really want to delete this data?`);

              const loading = $dialog.loading();
              try {
                const todo = await trpc.todo.delete.mutate({ todo_id, updated_at });

                $toast.success('Todo have been deleted.');

                $emit('done', { event: 'delete', todo });
              } finally {
                loading.close();
              }
            }
          "
        >
          <span class="capitalize">delete</span>
        </MyButton>
      </template>
    </TodoForm>
  </div>
)
