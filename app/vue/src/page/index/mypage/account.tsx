import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import MyButton from '~/component/button/MyButton.tsx';
import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

export default defineComponent(() => {
  const $router = useRouter();
  const $dialog = useDialog();
  const $toast = useToast();

  return () => (
    <div class="flex flex-col gap-6">
      <div>
        <div class="mb-4 text-2xl font-bold dark:text-white">Delete account</div>

        <section class="flex gap-4">
          <MyButton
            type="submit"
            color="red"
            variant="contained"
            onClick={async () => {
              if (
                (await $dialog.prompt.danger(
                  `You are about to permanently delete your account. This action cannot be undone. Please type 'delete permanently' to confirm.`,
                )) === 'confirm:delete permanently'
              ) {
                await trpc.mypage.delete.mutate();

                $toast.info('Your account has been deleted successfully.');
                $router.push({ name: '/(auth)/signin' });
              } else {
                $toast.info('Account deletion has been canceled.');
              }
            }}
          >
            Delete your account
          </MyButton>
        </section>
      </div>
    </div>
  );
});
