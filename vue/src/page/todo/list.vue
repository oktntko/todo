<script setup lang="ts">
import SpaceList from '~/page/todo/list/component/SpaceList.vue';
</script>

<template>
  <div class="flex flex-row">
    <SpaceList class="w-60 shrink-0"> </SpaceList>

    <RouterView v-slot="{ Component }" class="grow">
      <template v-if="Component">
        <Transition
          mode="out-in"
          enter-from-class="transform opacity-0"
          enter-active-class="transition ease-out duration-200"
          enter-to-class="transform opacity-100"
        >
          <KeepAlive>
            <Suspense>
              <!-- main content -->
              <component :is="Component"></component>

              <!-- loading state -->
              <template #fallback>
                <div>loading</div>
              </template>
            </Suspense>
          </KeepAlive>
        </Transition>
      </template>
    </RouterView>
  </div>
</template>
