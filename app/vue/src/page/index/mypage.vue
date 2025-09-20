<script setup lang="ts">
import { useMypageStore } from '~/store/MypageStore';

const { fetchMypage } = useMypageStore();

await fetchMypage();
</script>

<template>
  <div class="flex flex-row">
    <aside class="flex w-56 shrink-0 flex-col gap-2 px-4">
      <div>
        <ul class="text-sm">
          <li>
            <RouterLink
              :to="{
                name: '//mypage/',
              }"
              class="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
              exact-active-class="text-blue-600 border-l-blue-400!"
            >
              <span
                class="icon-[material-symbols--public] h-5 w-5 text-gray-500 group-hover:text-gray-900"
              >
              </span>
              <span class="ml-2">公開情報</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{
                name: '//mypage/change-password',
              }"
              class="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
              exact-active-class="text-blue-600 border-l-blue-400!"
            >
              <span
                class="icon-[mdi--password-outline] h-5 w-5 text-gray-500 group-hover:text-gray-900"
              >
              </span>
              <span class="ml-2">パスワード変更</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{
                name: '//mypage/security',
              }"
              class="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
              exact-active-class="text-blue-600 border-l-blue-400!"
            >
              <span
                class="icon-[wpf--security-checked] h-5 w-5 text-gray-500 group-hover:text-gray-900"
              >
              </span>
              <span class="ml-2">セキュリティ</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{
                name: '//mypage/chat',
              }"
              class="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
              exact-active-class="text-blue-600 border-l-blue-400!"
            >
              <span class="icon-[vaadin--chat] h-5 w-5 text-gray-500 group-hover:text-gray-900">
              </span>
              <span class="ml-2 capitalize">chat</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{
                name: '//mypage/account',
              }"
              class="group flex items-center rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
              exact-active-class="text-blue-600 border-l-blue-400!"
            >
              <span class="icon-[codicon--account] h-5 w-5 text-gray-500 group-hover:text-gray-900">
              </span>
              <span class="ml-2">アカウント</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </aside>

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
              <component :is="Component" class="px-4"></component>

              <!-- loading state -->
              <template #fallback>
                <div
                  class="container flex min-h-dvh grow flex-col items-center justify-center gap-4"
                >
                  <span
                    class="icon-[line-md--loading-loop] text-opacity-60 h-16 w-16 text-gray-600"
                  ></span>
                </div>
              </template>
            </Suspense>
          </KeepAlive>
        </Transition>
      </template>
    </RouterView>
  </div>
</template>
