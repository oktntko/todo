<script setup lang="ts">
import type { RouterOutput } from '~/lib/trpc';
import Space from '~/page/index/todo/component/Space.vue';
import SpaceList from '~/page/index/todo/component/SpaceList.vue';

const space_list = ref<RouterOutput['space']['list']['space_list']>([]);
</script>

<template>
  <div class="flex flex-row">
    <SpaceList v-model:space_list="space_list" class="w-56 shrink-0" type="radio"> </SpaceList>

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
          v-for="space of space_list"
          :key="space.space_id"
          class="shrink-0 break-inside-avoid"
          :class="['mx-auto w-2xl']"
        >
          <Space :space="space" class="max-h-full overflow-y-auto"></Space>
        </div>
      </div>
    </div>
  </div>
</template>
