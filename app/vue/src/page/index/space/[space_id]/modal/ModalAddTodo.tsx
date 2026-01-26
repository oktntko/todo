import type { TodoRouterSchema } from '@todo/express/schema';
import { type z } from '@todo/lib/zod';
import { defineComponent, ref } from 'vue';
import type { DownloadFile } from '~/component/MyDownloadFileList.vue';
import { trpc } from '~/lib/trpc';
import { satisfiesKeys, type EmitsType } from '~/lib/vue.ts';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import TodoForm, { type ModelValue } from '../component/TodoForm.tsx';

type Props = {
  space_id: string;
} & Partial<{
  group_id: string | null;
  begin_date: '' | `${number}-${number}-${number}`;
  begin_time: '' | `${number}:${number}`;
  limit_date: '' | `${number}-${number}-${number}`;
  limit_time: '' | `${number}:${number}`;
}>;
const props = satisfiesKeys<Props>()(
  'space_id',
  'group_id',
  'begin_date',
  'begin_time',
  'limit_date',
  'limit_time',
);

export type ModalAddTodoResult = { todo: z.infer<typeof TodoRouterSchema.getOutput> };
const emits = {
  done: (_: ModalAddTodoResult) => true,
} satisfies EmitsType;

export default defineComponent(
  ($props: Props, { emit: $emit }) => {
    const $toast = useToast();
    const $dialog = useDialog();

    const modelValue = ref<ModelValue>({
      group_id: $props.group_id ?? null,
      title: '',
      description: '',
      begin_date: $props.begin_date ?? '',
      begin_time: $props.begin_time ?? '',
      limit_date: $props.limit_date ?? '',
      limit_time: $props.limit_time ?? '',
      order: 0,
      done_at: null,
    });
    const modelValueFileList = ref<DownloadFile[]>([]);

    async function handleSubmit(value: ModelValue) {
      const loading = $dialog.loading();
      try {
        const todo = await trpc.todo.create.mutate(value);

        $toast.success('Todo has been saved.');

        $emit('done', { todo });
      } finally {
        loading.close();
      }
    }

    return () => (
      <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
        <header class="mb-4 text-lg font-bold capitalize">add todo</header>
        <TodoForm
          modelValue={modelValue.value}
          onUpdate:modelValue={(v) => (modelValue.value = v)}
          modelValueFileList={modelValueFileList.value}
          onUpdate:modelValueFileList={(v) => (modelValueFileList.value = v)}
          space_id={$props.space_id}
          onSubmit={handleSubmit}
        ></TodoForm>
      </div>
    );
  },
  {
    props,
    emits,
  },
);
