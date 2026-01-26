import { useTitle } from '@vueuse/core';
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router';
import MyButton from '~/component/button/MyButton.tsx';

export default defineComponent(() => {
  useTitle('Not Found | MyTodo');

  return () => (
    <section class="bg-gray-50">
      <div class="container mx-auto flex min-h-screen items-center px-6 py-12">
        <div class="mx-auto flex max-w-sm flex-col items-center text-center">
          <p class="rounded-full bg-blue-50 p-3 text-sm font-medium text-blue-500">
            <span class="icon-[fa6-regular--face-dizzy] h-8 w-8" />
          </p>

          <h1 class="text-2xl font-semibold text-gray-800 md:text-9xl">404</h1>

          <p class="mt-4 text-gray-500">Not Found</p>

          <div class="mt-6 flex w-full shrink-0 items-center gap-x-3 sm:w-auto">
            <MyButton tag={RouterLink} to={{ name: '/' }} color="blue">
              <span class="icon-[line-md--home-twotone] h-5 w-5 rtl:rotate-180" />
              <span>Back to Home</span>
            </MyButton>
          </div>
        </div>
      </div>
    </section>
  );
});
