<script setup lang="ts">
import { trpc } from '~/lib/trpc';
import { useModal } from '~/plugin/ModalPlugin';

const $router = useRouter();
const $modal = useModal();
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <div class="mb-4 text-2xl font-bold dark:text-white">Delete account</div>

      <section class="flex gap-4">
        <MyButton
          type="submit"
          color="red"
          variant="contained"
          @click="
            async () => {
              if (
                (await $modal.prompt.danger(
                  `You are about to permanently delete your account. This action cannot be undone. Please type 'delete permanently' to confirm.`,
                )) === 'confirm:delete permanently'
              ) {
                await trpc.mypage.delete.mutate();
                $toast.info('Your account has been deleted successfully.');
                $router.push({ name: '/(auth)/signin' });
              }
            }
          "
        >
          Delete your account
        </MyButton>
      </section>
    </div>
  </div>
</template>
