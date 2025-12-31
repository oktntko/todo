<script setup lang="ts">
import Group, { type TodoWithStatus } from '~/page/index/todo/component/Group.vue';
import GroupList from '~/page/index/todo/component/GroupList.vue';
import { useGroupStore } from '~/store/GroupStore';

const { storedGroupList } = storeToRefs(useGroupStore());
const checkedGroupList = ref(storedGroupList.value);

const { handleAdd, handleRemove } = (function () {
  const movingTodo = ref<(todo: TodoWithStatus) => void>();

  function handleAdd(callback: (todo: TodoWithStatus) => void) {
    // remove より先に呼ばれるため、 todo がイベント発火時点で特定できない
    // callback を保持し、 remove 実行時に呼び出してもらう
    movingTodo.value = callback;
  }

  function handleRemove(todo: TodoWithStatus) {
    movingTodo.value?.(todo);
    movingTodo.value = undefined;
  }

  return { handleAdd, handleRemove };
})();
</script>

<template>
  <div class="flex flex-row">
    <GroupList
      v-model="checkedGroupList"
      class="h-[calc(100vh-64px)] w-56 shrink-0 overflow-y-auto px-2"
      type="checkbox"
    >
    </GroupList>

    <!--
      w-[calc(100vw-224px-224px-10px)]
      224px: グローバルメニュー
      224px: GroupList
       10px: 縦スクロールバーを常時表示しているため
    -->
    <div
      class="h-[calc(100vh-64px)] w-[calc(100vw-224px-224px-10px)] grow-0 overflow-x-auto px-4 pb-4"
    >
      <div class="flex h-full w-full flex-row gap-2">
        <div
          v-for="group of checkedGroupList"
          :key="group.group_id"
          class="shrink-0 break-inside-avoid"
          :class="['w-2xl']"
        >
          <Group
            :group="group"
            class="max-h-full overflow-y-auto"
            @add="handleAdd"
            @remove="handleRemove"
          ></Group>
        </div>
      </div>
    </div>
  </div>
</template>
