import { R } from '@todo/lib/remeda';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import TodoForm, { type ModelValue } from '../../component/TodoForm.vue';

const $route = useRoute('//space/[space_id]/todo/table/[todo_id]');
const $router = useRouter();
const $toast = useToast();
const $dialog = useDialog();

const todo_id = $route.params.todo_id;
const todo = await trpc.todo.get.query({ todo_id });

const modelValue = ref<ModelValue>(R.omit(todo, ['file_list', 'group']));
const modelValueFileList = ref<DownloadFile[]>(todo.file_list);
const updated_at = todo.updated_at;

async function handleSubmit(value: ModelValue) {
  const loading = $dialog.loading();
  try {
    await trpc.todo.update.mutate({ ...value, todo_id, updated_at });

    $toast.success('Todo has been saved.');

    $router.push({
      name: '//space/[space_id]/todo/table/',
      params: {
        space_id: $route.params.space_id,
      },
    });
  } finally {
    loading.close();
  }
}

(
  <div class="mb-8 flex flex-col gap-4 px-4">
    <div>
      <nav aria-label="Breadcrumb">
        <MyBreadcrumb class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <RouterLink
            :to="{
              name: '//space/[space_id]/todo/table/',
              params: {
                space_id: $route.params.space_id,
              },
            }"
            class="inline-flex items-center gap-0.5 text-sm font-medium text-gray-400 hover:text-blue-600"
          >
            <span class="icon-[fontisto--table-2] h-3 w-3 transition duration-75"> </span>
            <span class="capitalize">table</span>
          </RouterLink>
          <RouterLink
            :to="{
              name: '//space/[space_id]/todo/table/[todo_id]',
              params: {
                space_id: $route.params.space_id,
                todo_id,
              },
            }"
            class="inline-flex items-center gap-0.5 text-sm font-medium text-gray-900"
          >
            <span class="capitalize">edit todo</span>
          </RouterLink>
        </MyBreadcrumb>
      </nav>
    </div>

    <div>
      <TodoForm
        v-model="modelValue"
        v-model:file_list="modelValueFileList"
        :space_id="$route.params.space_id"
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
                  await trpc.todo.delete.mutate({ todo_id, updated_at });

                  $toast.success('Todo have been deleted.');

                  $router.replace({
                    name: '//space/[space_id]/todo/table/',
                    params: {
                      space_id: $route.params.space_id,
                    },
                  });
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
  </div>
)
