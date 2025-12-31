<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { trpc } from '~/lib/trpc';
import GroupForm, { type ModelValue } from '~/page/index/todo/component/GroupForm.vue';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';
import { useGroupStore } from '~/store/GroupStore';

export type ModalEditGroupResult =
  | { event: 'update'; group: RouterOutput['group']['update'] }
  | { event: 'delete'; group: RouterOutput['group']['delete'] };

const $toast = useToast();
const $dialog = useDialog();

const $emit = defineEmits<{
  done: [ModalEditGroupResult];
}>();

const { storedGroupList } = storeToRefs(useGroupStore());

const props = defineProps<{
  group_id: number;
}>();

const group = await trpc.group.get.query({ group_id: props.group_id });

const modelValue = ref<ModelValue>(group);
const updated_at = group.updated_at;

async function handleSubmit(input: ModelValue) {
  const loading = $dialog.loading();
  try {
    const group = await trpc.group.update.mutate({
      ...input,
      group_id: props.group_id,
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
</script>

<template>
  <div class="rounded-lg bg-gray-100 p-8 text-gray-900 shadow-xl">
    <header class="mb-4 text-lg font-bold capitalize">edit group</header>
    <GroupForm v-model="modelValue" @submit="handleSubmit">
      <template #buttons>
        <MyButton
          type="button"
          color="yellow"
          variant="outlined"
          @click="
            async () => {
              await $dialog.confirm.warn(`Do you really want to delete this data?`);

              const loading = $dialog.loading();
              try {
                const group = await trpc.group.delete.mutate({ group_id, updated_at });

                storedGroupList = storedGroupList.filter((origin) => {
                  return origin.group_id !== group.group_id;
                });

                $toast.success('Data has been deleted.');

                $emit('done', { event: 'delete', group });
              } finally {
                loading.close();
              }
            }
          "
        >
          <span class="capitalize">delete</span>
        </MyButton>
      </template>
    </GroupForm>
  </div>
</template>
