import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';

import type { RouterOutput } from '~/lib/trpc';

import { trpc } from '~/lib/trpc';
import { type EmitsType } from '~/lib/vue.ts';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

import SpaceForm, { type ModelValue } from '../component/SpaceForm.tsx';

export type ModalAddSpaceResult = { space: RouterOutput['space']['create'] };

const emits = {
  done: (_: ModalAddSpaceResult) => true,
} satisfies EmitsType;

export default defineComponent(
  (_, { emit: $emit }) => {
    const $toast = useToast();
    const $dialog = useDialog();

    const { storedSpaceList } = storeToRefs(useSpaceStore());

    const modelValue = ref<ModelValue>({
      space_name: '',
      space_description: '',
      space_image: '',
      space_color: '#FFFFFF',
    });

    async function handleSubmit(input: ModelValue) {
      const loading = $dialog.loading();
      try {
        const space = await trpc.space.create.mutate(input);

        storedSpaceList.value.push(space);

        $toast.success('Data has been saved.');

        $emit('done', { space });
      } finally {
        loading.close();
      }
    }

    return () => (
      <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
        <header class="mb-4 text-lg font-bold capitalize">create new space</header>
        <SpaceForm
          modelValue={modelValue.value}
          onUpdate:modelValue={(v) => (modelValue.value = v)}
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
  {
    emits,
  },
);
