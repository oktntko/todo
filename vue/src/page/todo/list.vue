<script setup lang="ts">
import Space from '~/page/todo/component/Space.vue';
import SpaceList from '~/page/todo/component/SpaceList.vue';

const space_id_list = ref([]);
</script>

<template>
  <div class="flex flex-row">
    <SpaceList class="w-56 shrink-0" type="radio" v-model:space_id_list="space_id_list">
    </SpaceList>

    <!-- 
      w-[calc(100vw-224px-224px-10px)]
      224px: グローバルメニュー
      224px: SpaceList
       10px: 縦スクロールバーを常時表示しているため
    -->
    <div
      class="h-[calc(100vh-64px)] w-[calc(100vw-224px-224px-10px)] grow-0 overflow-x-auto px-4 pb-4"
      :class="['pr-56']"
    >
      <div class="flex h-full w-full flex-row gap-2">
        <div
          v-for="space_id of space_id_list"
          :key="space_id"
          class="shrink-0 break-inside-avoid"
          :class="['mx-auto w-2xl']"
        >
          <Space :space_id="space_id" class="max-h-full overflow-y-auto"></Space>
        </div>
      </div>
    </div>
  </div>
</template>
