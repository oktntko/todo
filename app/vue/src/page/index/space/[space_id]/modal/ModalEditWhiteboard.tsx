import { defineComponent, ref } from 'vue';

import type { RouterOutput } from '~/lib/trpc';

import MyButton from '~/component/button/MyButton.tsx';
import { trpc } from '~/lib/trpc';
import { satisfiesKeys, type EmitsType } from '~/lib/vue.ts';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

import WhiteboardForm, {
  type ModelValue,
  type WhiteboardFormSlots,
} from '../component/WhiteboardForm.tsx';

type Props = {
  whiteboard_id: string;
};
const props = satisfiesKeys<Props>()('whiteboard_id');

export type ModalEditWhiteboardResult =
  | { event: 'update'; whiteboard: RouterOutput['whiteboard']['update'] }
  | { event: 'delete'; whiteboard: RouterOutput['whiteboard']['delete'] };
const emits = {
  done: (_: ModalEditWhiteboardResult) => true,
} satisfies EmitsType;

export default defineComponent(
  async ($props: Props, { emit: $emit }) => {
    const $toast = useToast();
    const $dialog = useDialog();

    const whiteboard = await trpc.whiteboard.get.query({ whiteboard_id: $props.whiteboard_id });

    const modelValue = ref<ModelValue>(whiteboard);
    const updated_at = whiteboard.updated_at;

    async function handleSubmit(input: ModelValue) {
      const loading = $dialog.loading();
      try {
        const whiteboard = await trpc.whiteboard.update.mutate({
          ...input,
          whiteboard_id: $props.whiteboard_id,
          updated_at,
        });

        $toast.success('Data has been saved.');

        $emit('done', { event: 'update', whiteboard });
      } finally {
        loading.close();
      }
    }

    return () => (
      <div class="w-sm rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
        <header class="mb-4 text-lg font-bold capitalize">edit whiteboard</header>
        <WhiteboardForm
          modelValue={modelValue.value}
          onUpdate:modelValue={(v) => (modelValue.value = v)}
          onSubmit={handleSubmit}
          v-slots={
            {
              buttons: () => (
                <MyButton
                  type="button"
                  color="yellow"
                  variant="outlined"
                  onClick={async () => {
                    await $dialog.confirm.warn(`Do you really want to delete this data?`);

                    const loading = $dialog.loading();
                    try {
                      const whiteboard = await trpc.whiteboard.delete.mutate({
                        whiteboard_id: $props.whiteboard_id,
                        updated_at,
                      });

                      $toast.success('Data has been deleted.');

                      $emit('done', { event: 'delete', whiteboard });
                    } finally {
                      loading.close();
                    }
                  }}
                >
                  <span class="capitalize">delete</span>
                </MyButton>
              ),
            } satisfies WhiteboardFormSlots
          }
        ></WhiteboardForm>
      </div>
    );
  },
  {
    props,
    emits,
  },
);
