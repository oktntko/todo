import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';
import MyButton from '~/component/button/MyButton';
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import { satisfiesKeys, type EmitsType } from '~/lib/vue.ts';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useGroupStore } from '~/store/GroupStore';
import GroupForm, { type GroupFormSlots, type ModelValue } from '../component/GroupForm.tsx';

type Props = {
  group_id: string;
};
const props = satisfiesKeys<Props>()('group_id');

export type ModalEditGroupResult =
  | { event: 'update'; group: RouterOutput['group']['update'] }
  | { event: 'delete'; group: RouterOutput['group']['delete'] };
const emits = {
  done: (_: ModalEditGroupResult) => true,
} satisfies EmitsType;

export default defineComponent(
  async ({ group_id }: Props, { emit: $emit }) => {
    const $toast = useToast();
    const $dialog = useDialog();

    const { storedGroupList } = storeToRefs(useGroupStore());

    const group = await trpc.group.get.query({ group_id });

    const modelValue = ref<ModelValue>(group);
    const updated_at = group.updated_at;

    async function handleSubmit(input: ModelValue) {
      const loading = $dialog.loading();
      try {
        const group = await trpc.group.update.mutate({
          ...input,
          group_id,
          updated_at,
        });

        storedGroupList.value = storedGroupList.value.map((origin) =>
          origin.group_id === group.group_id ? { ...origin, ...group } : origin,
        );

        $toast.success('Data has been saved.');

        $emit('done', { event: 'update', group });
      } finally {
        loading.close();
      }
    }

    return () => (
      <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
        <header class="mb-4 text-lg font-bold capitalize">edit group</header>
        <GroupForm
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
                      const group = await trpc.group.delete.mutate({ group_id, updated_at });

                      storedGroupList.value = storedGroupList.value.filter((origin) => {
                        return origin.group_id !== group.group_id;
                      });

                      $toast.success('Data has been deleted.');

                      $emit('done', { event: 'delete', group });
                    } finally {
                      loading.close();
                    }
                  }}
                >
                  <span class="capitalize">delete</span>
                </MyButton>
              ),
            } satisfies GroupFormSlots
          }
        ></GroupForm>
      </div>
    );
  },
  {
    props,
    emits,
  },
);
