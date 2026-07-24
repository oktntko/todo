import { defineComponent, onMounted, ref, Transition } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import MyLoading from '~/component/MyLoading';
import { useAichatStore } from '~/store/AichatStore';
import { useGroupStore } from '~/store/GroupStore';

export default defineComponent(() => {
  const $route = useRoute('//space/[space_id]/');

  const { fetchGroup } = useGroupStore();
  const { fetchAichat } = useAichatStore();

  const loading = ref(true);
  onMounted(async () => {
    try {
      await Promise.all([
        fetchGroup({ space_id: $route.params.space_id }),
        fetchAichat({ space_id: $route.params.space_id }),
      ]);
    } finally {
      loading.value = false;
    }
  });

  return () => (
    <div class="h-full">
      <Transition
        mode="out-in"
        enter-from-class="transform opacity-0"
        enter-active-class="transition ease-out duration-200"
        enter-to-class="transform opacity-100"
      >
        {loading.value ? (
          <MyLoading />
        ) : (
          <div class="h-full">
            <RouterView />
          </div>
        )}
      </Transition>
    </div>
  );
});
