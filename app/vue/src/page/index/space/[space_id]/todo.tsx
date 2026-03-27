import { defineComponent, Suspense, Transition, type DefineComponent } from 'vue';
import { RouterView, useRoute } from 'vue-router';

import { useGroupStore } from '~/store/GroupStore';

export default defineComponent(async () => {
  const $route = useRoute('//space/[space_id]/todo');

  const { fetchGroup } = useGroupStore();

  await fetchGroup({ space_id: $route.params.space_id });

  return () => (
    <div>
      <RouterView
        v-slots={{
          default: ({ Component }: { Component?: DefineComponent }) =>
            Component && (
              <Transition
                mode="out-in"
                enter-from-class="transform opacity-0"
                enter-active-class="transition ease-out duration-200"
                enter-to-class="transform opacity-100"
              >
                <Suspense
                  v-slots={{
                    default: () => <Component></Component>,
                    fallback: () => {
                      return (
                        <div class="container flex min-h-dvh grow flex-col items-center justify-center gap-4">
                          <span class="icon-[eos-icons--bubble-loading] text-opacity-60 h-16 w-16 text-gray-600"></span>
                          <span class="sr-only">Loading...</span>
                          <input
                            autofocus
                            name="loading"
                            class="h-0 w-0 border-none bg-transparent caret-transparent outline-hidden"
                          />
                        </div>
                      );
                    },
                  }}
                ></Suspense>
              </Transition>
            ),
        }}
      ></RouterView>
    </div>
  );
});
