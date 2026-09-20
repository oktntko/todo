import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { MyButton } from '~/component/button/MyButton';
import { hono } from '~/middleware/hono';
import { useToast } from '~/plugin/useToast';

export const Route = createFileRoute('/_main/mypage/account')({
  component: function Page() {
    const $navigate = useNavigate();
    // const $dialog = useDialog();
    const $toast = useToast();

    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-4 text-2xl font-bold dark:text-white">Delete account</div>

          <section className="flex gap-2">
            <MyButton
              type="submit"
              color="red"
              variant="contained"
              onClick={async () => {
                if (
                  // (await $dialog.prompt.danger(
                  //   `You are about to permanently delete your account. This action cannot be undone. Please type 'delete permanently' to confirm.`,
                  // )) === 'confirm:delete permanently'
                  window.prompt(
                    `You are about to permanently delete your account. This action cannot be undone. Please type 'delete permanently' to confirm.`,
                  ) === 'confirm:delete permanently'
                ) {
                  await hono.mypage.delete.$post();

                  $toast.info('Your account has been deleted successfully.');
                  return $navigate({ to: '/signin' });
                } else {
                  return $toast.info('Account deletion has been canceled.');
                }
              }}
            >
              Delete your account
            </MyButton>
          </section>
        </div>
      </div>
    );
  },
});
