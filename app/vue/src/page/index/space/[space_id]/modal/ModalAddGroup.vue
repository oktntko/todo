<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useGroupStore } from '~/store/GroupStore';
import GroupForm, { type ModelValue } from '../component/GroupForm.vue';

export type ModalAddGroupResult = { group: RouterOutput['group']['create'] };

const $emit = defineEmits<{
  done: [ModalAddGroupResult];
}>();

const { storedGroupList } = storeToRefs(useGroupStore());

const { space_id } = defineProps<{
  space_id: string;
}>();

const modelValue = ref<ModelValue>({
  space_id,
  group_name: '',
  group_description: '',
  group_image: '',
  group_color: '#FFFFFF',
});

const $toast = useToast();
const $dialog = useDialog();

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
</script>

<template>
  <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
    <header class="mb-4 text-lg font-bold capitalize">create new group</header>
    <GroupForm v-model="modelValue" @submit="handleSubmit"> </GroupForm>
  </div>
</template>
