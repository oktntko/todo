<script setup lang="ts">
import { useSpaceStore } from '~/store/SpaceStore';

const { fetchSpace } = useSpaceStore();

await fetchSpace();
</script>

<template>
  <div>
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <Transition
          mode="out-in"
          enter-from-class="transform opacity-0"
          enter-active-class="transition ease-out duration-200"
          enter-to-class="transform opacity-100"
        >
          <Suspense>
            <!-- main content -->
            <component :is="Component"></component>

            <!-- loading state -->
            <template #fallback>
              <div class="container flex min-h-dvh grow flex-col items-center justify-center gap-4">
                <span
                  class="icon-[line-md--loading-loop] text-opacity-60 h-16 w-16 text-gray-600"
                ></span>
              </div>
            </template>
          </Suspense>
        </Transition>
      </template>
    </RouterView>
  </div>
</template>
