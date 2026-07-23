import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';

import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

import type { ModelValue, Reset } from '../component/SpaceForm';

import SpaceForm from '../component/SpaceForm';

export default defineComponent(() => {
  const $dialog = useDialog();
  const $toast = useToast();

  const { currentSpace } = storeToRefs(useSpaceStore());

  const modelValue = ref<ModelValue>({
    ...currentSpace.value!,
  });

  async function handleSubmit(input: ModelValue, reset: Reset) {
    const loading = $dialog.loading();
    try {
      const updatedSpace = await trpc.space.update.mutate({
        ...input,
        space_id: currentSpace.value!.space_id,
        updated_at: currentSpace.value!.updated_at,
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
});
