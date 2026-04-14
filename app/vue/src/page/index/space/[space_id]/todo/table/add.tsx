import { defineComponent, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

import type { DownloadFile } from '~/component/type';

import MyBreadcrumb from '~/component/navi/MyBreadcrumb.vue';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

import TodoForm, { type ModelValue } from '../../component/TodoForm.tsx';

export default defineComponent(() => {
  const $route = useRoute('//space/[space_id]/todo/table/add');
  const $router = useRouter();
  const $toast = useToast();
  const $dialog = useDialog();

  const modelValue = ref<ModelValue>({
    group_id: null,
    title: '',
    description: '',
    begin_date: '',
    begin_time: '',
    limit_date: '',
    limit_time: '',
    order: 0,
    done_at: null,
  });
  const modelValueFileList = ref<DownloadFile[]>([]);

  async function handleSubmit(value: ModelValue) {
    const loading = $dialog.loading();
    try {
      await trpc.todo.create.mutate(value);

      $toast.success('Todo has been saved.');

      return $router.push({
        name: '//space/[space_id]/todo/table/',
        params: {
          space_id: $route.params.space_id,
        },
      });
    } finally {
      loading.close();
    }
  }

  return () => (
    <div class="mb-8 flex flex-col gap-4 px-4">
      <div>
        <nav aria-label="Breadcrumb">
          <MyBreadcrumb class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <RouterLink
              to={{
                name: '//space/[space_id]/todo/table/',
                params: {
                  space_id: $route.params.space_id,
                },
              }}
              class="inline-flex items-center gap-0.5 text-sm font-medium text-gray-400 hover:text-blue-600"
            >
              <span class="icon-[fontisto--table-2] h-3 w-3 transition"> </span>
              <span class="capitalize">table</span>
            </RouterLink>
            <RouterLink
              to={{
                name: '//space/[space_id]/todo/table/add',
                params: {
                  space_id: $route.params.space_id,
                },
              }}
              class="inline-flex items-center gap-0.5 text-sm font-medium text-gray-900"
            >
              <span class="capitalize">add todo</span>
            </RouterLink>
          </MyBreadcrumb>
        </nav>
      </div>

      <div>
        <TodoForm
          modelValue={modelValue.value}
          onUpdate:modelValue={(v) => (modelValue.value = v)}
          modelValueFileList={modelValueFileList.value}
          onUpdate:modelValueFileList={(v) => (modelValueFileList.value = v)}
          space_id={$route.params.space_id}
          onSubmit={handleSubmit}
        ></TodoForm>
      </div>
    </div>
  );
});
