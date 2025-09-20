<script setup lang="ts"></script>

<template>
  <div class="flex min-h-screen">
    <aside class="flex w-56 shrink-0 flex-col gap-6 bg-gray-900 p-4 text-gray-50">
      <h1 class="flex items-center gap-1 text-2xl font-semibold">
        <span class="icon-[flat-color-icons--todo-list] h-8 w-8 p-2"></span>
        <span class="">MyTodo</span>
      </h1>
      <div class="h-full">
        <ul class="font-medium">
          <li>
            <div class="flex w-full items-center rounded-lg p-2 text-sm text-gray-500">
              <span class="icon-[quill--todo] h-4 w-4 text-gray-500"> </span>
              <span class="ms-2 capitalize">todo</span>
            </div>

            <ul class="ml-3 border-l border-gray-600">
              <li>
                <RouterLink
                  :to="{
                    name: '//todo/list',
                  }"
                  class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
                  active-class="bg-gray-700"
                >
                  <span
                    class="icon-[vaadin--list-ol] h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white"
                  >
                  </span>
                  <span class="ms-2 capitalize">list</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  :to="{
                    name: '//todo/table/',
                  }"
                  class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
                  active-class="bg-gray-700"
                >
                  <span
                    class="icon-[fontisto--table-2] h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white"
                  >
                  </span>
                  <span class="ms-2 capitalize">table</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  :to="{
                    name: '//todo/board',
                  }"
                  class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
                  active-class="bg-gray-700"
                >
                  <span
                    class="icon-[bi--kanban-fill] h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white"
                  >
                  </span>
                  <span class="ms-2 capitalize">board</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  :to="{
                    name: '//todo/calendar',
                  }"
                  class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
                  active-class="bg-gray-700"
                >
                  <span
                    class="icon-[subway--calendar-2] h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white"
                  >
                  </span>
                  <span class="ms-2 capitalize">calendar</span>
                </RouterLink>
              </li>
            </ul>
          </li>
          <li>
            <RouterLink
              :to="{
                name: '//drive/',
              }"
              class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-700"
            >
              <span
                class="icon-[vaadin--folder-open] h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white"
              >
              </span>
              <span class="ms-2 capitalize">drive</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{
                name: '//chat',
              }"
              class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-700"
            >
              <span
                class="icon-[vaadin--chat] h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white"
              >
              </span>
              <span class="ms-2 capitalize">chat</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{
                name: '//mypage/',
              }"
              class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
              active-class="bg-gray-700"
            >
              <span
                class="icon-[radix-icons--avatar] h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white"
              >
              </span>
              <span class="ms-2 capitalize">my page</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </aside>

    <div
      class="flex min-h-screen grow flex-col bg-linear-to-b from-white to-gray-200 text-gray-900"
    >
      <header class="flex h-16 flex-row flex-nowrap items-center justify-between p-4">
        <nav class="flex items-center">
          <button
            type="button"
            :class="[
              'flex w-48 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-2 py-1 text-sm text-gray-900 transition-colors hover:border-blue-500 hover:bg-white hover:ring-blue-500',
            ]"
          >
            <span class="icon-[bx--search] h-4 w-4"> </span>
            <span class="text-gray-500 capitalize">search</span>
          </button>
        </nav>

        <nav class="flex items-center gap-2">
          <button
            type="button"
            class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
            title="bookmark"
          >
            <span class="icon-[bxs--bookmark] h-5 w-5"></span>
            <span class="sr-only capitalize">bookmark</span>
          </button>
          <button
            type="button"
            class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
            title="notification"
          >
            <span class="icon-[bx--notification] h-5 w-5"></span>
            <span class="sr-only capitalize">notification</span>
          </button>
          <button
            type="button"
            class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
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
