<script setup lang="ts">
import { useMypageStore } from '~/store/MypageStore';

const { fetchMypage } = useMypageStore();

await fetchMypage();
</script>

<template>
  <div class="container mx-auto flex max-w-5xl flex-row">
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
              <span class="ml-2 capitalize">profile</span>
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
              <span class="ml-2 capitalize">change password</span>
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
              <span class="ml-2 capitalize">security</span>
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
              <span class="ml-2 capitalize">account</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </aside>

    <div class="grow">
      <RouterView> </RouterView>
    </div>
  </div>
</template>
