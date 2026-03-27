import type { InjectionKey, Ref } from 'vue';

import { storeToRefs } from 'pinia';
import { defineComponent, inject, provide, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import type { RouterOutput } from '~/lib/trpc';

import { useSpaceStore } from '~/store/SpaceStore';

const currentSpaceKey: InjectionKey<Ref<RouterOutput['space']['list'][number]>> =
  Symbol('current-space');

export function useCurrentSpace() {
  return inject<Ref<RouterOutput['space']['list'][number]>>(currentSpaceKey)!;
}

export default defineComponent(() => {
  const $route = useRoute('//space/[space_id]');

  const { storedSpaceList } = storeToRefs(useSpaceStore());
  const currentSpace = ref(
    storedSpaceList.value.find((space) => space.space_id === $route.params.space_id)!,
  );
  provide(currentSpaceKey, currentSpace);

  watch(currentSpace, (newValue) => {
    const index = storedSpaceList.value.findIndex(
      (space) => space.space_id === $route.params.space_id,
    );

    if (index < 0) {
      return;
    }

    storedSpaceList.value[index] = newValue;
  });

  return () => <RouterView />;
});
