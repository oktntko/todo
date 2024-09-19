<script setup lang="ts">
import { useTagStore } from '~/store/TagStore';

const { fetchTagList } = useTagStore();

fetchTagList();
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-60 shrink-0 bg-gray-900 text-gray-50 p-4 flex flex-col gap-6">
      <h1 class="flex items-center gap-1 text-2xl font-semibold">
        <span class="icon-[flat-color-icons--todo-list] h-8 w-8 p-2"></span>
        <span class="">MyTodo</span>
      </h1>
      <div class="h-full">
        <ul class="space-y-1 font-medium">
          <li>
            <div class="flex items-center w-full p-2 text-gray-500 rounded-lg text-sm">
              <span class="icon-[quill--todo] w-4 h-4 text-gray-500"> </span>
              <span class="ms-2 capitalize">todo</span>
            </div>

            <ul class="space-y-1 border-l border-gray-600 ml-3">
              <li>
                <RouterLink
                  to="/todo/list"
                  class="flex items-center w-full p-2 transition duration-75 pl-3 rounded-lg group hover:bg-gray-800 text-gray-200 hover:text-white text-base"
                >
                  <span
                    class="icon-[vaadin--list-ol] w-5 h-5 text-gray-200 transition duration-75 group-hover:text-white"
                  >
                  </span>
                  <span class="ms-2 capitalize">list</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/todo/list"
                  class="flex items-center w-full p-2 transition duration-75 pl-3 rounded-lg group hover:bg-gray-800 text-gray-200 hover:text-white text-base"
                >
                  <span
                    class="icon-[fontisto--table-2] w-5 h-5 text-gray-200 transition duration-75 group-hover:text-white"
                  >
                  </span>
                  <span class="ms-2 capitalize">table</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/todo/list"
                  class="flex items-center w-full p-2 transition duration-75 pl-3 rounded-lg group hover:bg-gray-800 text-gray-200 hover:text-white text-base"
                >
                  <span
                    class="icon-[bi--kanban-fill] w-5 h-5 text-gray-200 transition duration-75 group-hover:text-white"
                  >
                  </span>
                  <span class="ms-2 capitalize">board</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/todo/list"
                  class="flex items-center w-full p-2 transition duration-75 pl-3 rounded-lg group hover:bg-gray-800 text-gray-200 hover:text-white text-base"
                >
                  <span
                    class="icon-[subway--calendar-2] w-5 h-5 text-gray-200 transition duration-75 group-hover:text-white"
                  >
                  </span>
                  <span class="ms-2 capitalize">calendar</span>
                </RouterLink>
              </li>
            </ul>
          </li>
          <li>
            <RouterLink
              to="/"
              class="flex items-center w-full p-2 transition duration-75 rounded-lg group hover:bg-gray-800 text-gray-200 hover:text-white text-base"
            >
              <span
                class="icon-[vaadin--folder-open] w-5 h-5 text-gray-200 transition duration-75 group-hover:text-white"
              >
              </span>
              <span class="ms-2 capitalize">drive</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/"
              class="flex items-center w-full p-2 transition duration-75 rounded-lg group hover:bg-gray-800 text-gray-200 hover:text-white text-base"
            >
              <span
                class="icon-[vaadin--chat] w-5 h-5 text-gray-200 transition duration-75 group-hover:text-white"
              >
              </span>
              <span class="ms-2 capitalize">chat</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </aside>

    <div
      class="grow flex flex-col bg-gradient-to-b from-white to-gray-200 min-h-screen text-gray-900"
    >
      <header class="flex flex-nowrap items-center justify-between px-4 py-2 flex-row">
        <nav class="flex items-center">
          <button
            type="button"
            :class="[
              'w-48 flex items-center gap-2 bg-gray-100 border px-4 py-2 border-gray-300 text-gray-900 text-sm rounded-lg hover:ring-blue-500 hover:border-blue-500 transition-colors hover:bg-white',
            ]"
          >
            <span class="icon-[bx--search] h-4 w-4"> </span>
            <span class="text-gray-500 capitalize">search</span>
          </button>
        </nav>

        <nav class="flex items-center gap-2">
          <button
            type="button"
            class="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-200 transition-colors"
            title="bookmark"
          >
            <span class="icon-[bxs--bookmark] h-5 w-5"></span>
            <span class="sr-only capitalize">bookmark</span>
          </button>
          <button
            type="button"
            class="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-200 transition-colors"
            title="notification"
          >
            <span class="icon-[bx--notification] h-5 w-5"></span>
            <span class="sr-only capitalize">notification</span>
          </button>
          <button
            type="button"
            class="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-200 transition-colors"
            title="avatar"
          >
            <span class="icon-[radix-icons--avatar] h-5 w-5"></span>
            <span class="sr-only capitalize">avatar</span>
          </button>
        </nav>
      </header>

      <div class="grow">
        <RouterView />
      </div>
    </div>
  </div>
</template>
