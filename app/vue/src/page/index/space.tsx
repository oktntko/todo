import { defineComponent, Suspense, Transition, type DefineComponent } from 'vue';
import { RouterView } from 'vue-router';

import { useSpaceStore } from '~/store/SpaceStore';

export default defineComponent(async () => {
  const { fetchSpace } = useSpaceStore();

  await fetchSpace();

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
                        <div class="flex flex-col items-center bg-transparent p-8">
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
