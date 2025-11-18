<script setup lang="ts">
import { trpc } from '~/lib/trpc';

const $router = useRouter();
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <div class="mb-4 text-2xl font-bold dark:text-white">Delete account</div>

      <section class="flex gap-4">
        <button
          type="submit"
          :class="[
            'inline-flex items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
            'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-100 disabled:hover:bg-gray-400 disabled:hover:text-gray-200',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-red-700 bg-red-600 text-white hover:bg-red-800',
            'capitalize',
          ]"
          @click="
            async () => {
              if (
                // TODO: promptも作りたいの
                $window.prompt(`You are about to permanently delete your account. This action cannot be undone.
Please type 'delete permanently' to confirm.`) === 'delete permanently'
              ) {
                await trpc.mypage.delete.mutate();

                $toast.info('Your account has been deleted successfully.');
                $router.push({ name: '/(auth)/signin' });
              }
            }
          "
        >
          Delete your account
        </button>
      </section>
    </div>
  </div>
</template>
