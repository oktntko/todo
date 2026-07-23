import { R } from '@todo/lib/remeda';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { trpc, type RouterOutput } from '~/lib/trpc';

export const useSpaceStore = defineStore('space', () => {
  const $route = useRoute('//space/[space_id]');

  const storedSpaceList = ref<RouterOutput['space']['list']>([]);

  const initialize = R.once(() => {
    currentSpace.value =
      storedSpaceList.value.find((space) => space.space_id === $route.params.space_id) ??
      storedSpaceList.value[0];
  });

  async function fetchSpace() {
    storedSpaceList.value = await trpc.space.list.query();
    initialize();
  }

  const currentSpace = ref<RouterOutput['space']['list'][number]>();

  watch(
    () => $route.params.space_id,
    () => {
      const index = storedSpaceList.value.findIndex(
        (space) => space.space_id === $route.params.space_id,
      );

      if (index < 0) {
        return;
      }

      currentSpace.value = storedSpaceList.value[index];
    },
    { immediate: true },
  );

  watch(currentSpace, (newValue) => {
    const index = storedSpaceList.value.findIndex(
      (space) => space.space_id === $route.params.space_id,
    );

    if (index < 0 || newValue == null) {
      return;
    }

    storedSpaceList.value[index] = newValue;
  });

  return { storedSpaceList, fetchSpace, currentSpace };
});
