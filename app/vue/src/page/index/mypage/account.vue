<script setup lang="ts">
import { trpc } from '~/lib/trpc';

const $router = useRouter();
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h4 class="mb-4 text-2xl font-bold dark:text-white">アカウントを削除する</h4>

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
                $window.prompt(`
アカウントを削除します。この操作は取り消せません。本当に削除してもよろしいですか？
「 完全に削除 」と入力してください。`) === '完全に削除'
              ) {
                await trpc.mypage.delete.mutate();

                $toast.info('アカウントを削除しました。');
                $router.push({ name: '/(auth)/login' });
              }
            }
          "
        >
          アカウントを削除する
        </button>
      </section>
    </div>
  </div>
</template>
