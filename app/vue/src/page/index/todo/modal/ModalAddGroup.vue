<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import GroupForm, { type ModelValue } from '~/page/index/todo/component/GroupForm.vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useGroupStore } from '~/store/GroupStore';

export type ModalAddGroupResult = { group: RouterOutput['group']['create'] };

const $emit = defineEmits<{
  done: [ModalAddGroupResult];
}>();

const { storedGroupList } = storeToRefs(useGroupStore());

const modelValue = ref<ModelValue>({
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
