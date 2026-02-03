import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';

import type { RouterOutput } from '~/lib/trpc';

import { trpc } from '~/lib/trpc';
import { satisfiesKeys, type EmitsType } from '~/lib/vue.ts';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useGroupStore } from '~/store/GroupStore';

import GroupForm, { type ModelValue } from '../component/GroupForm.tsx';

export type ModalAddGroupResult = { group: RouterOutput['group']['create'] };
type Props = {
  space_id: string;
};
const props = satisfiesKeys<Props>()('space_id');

const emits = {
  done: (_: ModalAddGroupResult) => true,
} satisfies EmitsType;

export default defineComponent(
  ({ space_id }: Props, { emit: $emit }) => {
    const $toast = useToast();
    const $dialog = useDialog();

    const { storedGroupList } = storeToRefs(useGroupStore());

    const modelValue = ref<ModelValue>({
      space_id,
      group_name: '',
      group_description: '',
      group_image: '',
      group_color: '#FFFFFF',
    });

    async function handleSubmit(input: ModelValue) {
      const loading = $dialog.loading();
      try {
        const group = await trpc.group.create.mutate(input);

        storedGroupList.value.push(group);

        $toast.success('Data has been saved.');

        $emit('done', { group });
      } finally {
        loading.close();
      }
    }

    return () => (
      <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
        <header class="mb-4 text-lg font-bold capitalize">create new group</header>
        <GroupForm
          modelValue={modelValue.value}
          onUpdate:modelValue={(v) => (modelValue.value = v)}
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
  {
    props,
    emits,
  },
);
