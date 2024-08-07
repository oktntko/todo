<script setup lang="ts">
useTitle('お探しのページは存在しません | MyTodo');
</script>

<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto flex min-h-screen items-center px-6 py-12">
      <div class="mx-auto flex max-w-sm flex-col items-center text-center">
        <p class="rounded-full bg-blue-50 p-3 text-sm font-medium text-blue-500 dark:bg-gray-800">
          <span class="h-8 w-8 icon-[fa6-regular--face-dizzy]"> </span>
        </p>
        <h1 class="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-9xl">404</h1>
        <p class="mt-4 text-gray-500 dark:text-gray-400">
          お探しのページは存在しないか、移動されました。
        </p>

        <div class="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
          <RouterLink
            to="/"
            class="flex w-1/2 items-center justify-center gap-x-2 rounded-lg border bg-white px-5 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
          >
            <span class="h-5 w-5 rtl:rotate-180 icon-[line-md--home-twotone]"></span>
            <span>ホームに戻る</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
