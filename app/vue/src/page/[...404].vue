<script setup lang="ts">
import { RouterLink } from 'vue-router';
useTitle('Not Found | MyTodo');
</script>

<template>
  <section class="bg-gray-50">
    <div class="container mx-auto flex min-h-screen items-center px-6 py-12">
      <div class="mx-auto flex max-w-sm flex-col items-center text-center">
        <p class="rounded-full bg-blue-50 p-3 text-sm font-medium text-blue-500">
          <span class="icon-[fa6-regular--face-dizzy] h-8 w-8"> </span>
        </p>
        <h1 class="text-2xl font-semibold text-gray-800 md:text-9xl">404</h1>
        <p class="mt-4 text-gray-500">Not Found</p>

        <div class="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
          <MyButton :tag="RouterLink" :to="{ name: '/' }" color="blue">
            <span class="icon-[line-md--home-twotone] h-5 w-5 rtl:rotate-180"></span>
            <span>Back to Home</span>
          </MyButton>
        </div>
      </div>
    </div>
  </section>
</template>
