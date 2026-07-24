import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';

import { trpc, type RouterOutput } from '~/lib/trpc';
import { satisfiesKeys } from '~/lib/vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

import type { ModelValue, Reset } from '../component/SpaceForm';

import SpaceForm from '../component/SpaceForm';

type Props = {
  space: NonNullable<RouterOutput['space']['list'][number]>;
};
const props = satisfiesKeys<Props>()('space');

export default defineComponent(
  ($props: Props) => {
    const $dialog = useDialog();
    const $toast = useToast();

    const { currentSpace } = storeToRefs(useSpaceStore());

    const modelValue = ref<ModelValue>({
      ...$props.space,
    });

    async function handleSubmit(input: ModelValue, reset: Reset) {
      const loading = $dialog.loading();
      try {
        const updatedSpace = await trpc.space.update.mutate({
          ...input,
          space_id: $props.space.space_id,
          updated_at: $props.space.updated_at,
        });

        currentSpace.value = updatedSpace;

        reset(updatedSpace);

        $toast.success('Data saved successfully.');
      } finally {
        loading.close();
      }
    }

    return () => (
      <SpaceForm
        modelValue={modelValue.value}
        onUpdate:modelValue={(v) => (modelValue.value = v)}
        onSubmit={handleSubmit}
      />
    );
  },
  {
    props,
  },
);
