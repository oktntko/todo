<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import { useGroupStore } from '~/store/GroupStore';
import Group from '../component/Group.vue';
import GroupList from '../component/GroupList.vue';

const $route = useRoute('//space/[space_id]/todo/list');

const { storedGroupList } = storeToRefs(useGroupStore());
const checkedGroupList = ref<RouterOutput['group']['list']>(
  storedGroupList.value[0] ? [storedGroupList.value[0]] : [],
);
</script>

<template>
  <div class="flex flex-row">
    <GroupList
      v-model="checkedGroupList"
      class="h-[calc(100vh-64px)] w-56 shrink-0 overflow-y-auto px-2"
      type="radio"
      :space_id="$route.params.space_id"
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
      :class="['pr-56']"
    >
      <div class="flex h-full w-full flex-row gap-2">
        <div
          v-for="group of checkedGroupList"
          :key="group.group_id"
          class="shrink-0 break-inside-avoid"
          :class="['mx-auto w-2xl']"
        >
          <Group
            :group="group"
            :space_id="$route.params.space_id"
            class="max-h-full overflow-y-auto"
          ></Group>
        </div>
      </div>
    </div>
  </div>
</template>
