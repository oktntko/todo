import { defineComponent } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';

import { trpc } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';

export default defineComponent(async () => {
  const $router = useRouter();
  const $dialog = useDialog();

  return () => (
    <div class="container mx-auto flex max-w-5xl flex-row">
      <aside class="flex w-56 shrink-0 flex-col gap-2 px-4">
        <div>
          <ul class="text-sm">
            {(
              [
                {
                  name: 'profile',
                  route: '//mypage/',
                  icon: 'icon-[material-symbols--public]',
                },
                {
                  name: 'change password',
                  route: '//mypage/change-password',
                  icon: 'icon-[mdi--password-outline]',
                },
                {
                  name: 'security',
                  route: '//mypage/security',
                  icon: 'icon-[wpf--security-checked]',
                },
                {
                  name: 'notification',
                  route: '//mypage/notification',
                  icon: 'icon-[bx--notification]',
                },
                {
                  name: 'account',
                  route: '//mypage/account',
                  icon: 'icon-[codicon--account]',
                },
              ] as const
            ).map((item) => {
              return (
                <li>
                  <RouterLink
                    to={{ name: item.route }}
                    class="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 transition-colors hover:bg-gray-100"
                    exact-active-class="text-blue-600 border-l-blue-400!"
                  >
                    <span class={`${item.icon} h-5 w-5 text-gray-500 group-hover:text-gray-900`} />
                    <span class="capitalize">{item.name}</span>
                  </RouterLink>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                class="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 transition-colors hover:bg-gray-100"
                onClick={async () => {
                  await $dialog.confirm.info('Are you sure you want to sign out?');

                  void trpc.auth.delete.mutate();
                  return $router.push({ name: '/(auth)/signin' });
                }}
              >
                <span class="icon-[stash--signout-alt] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                <span class="capitalize">signout</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <div class="min-w-0 grow">
        <RouterView />
      </div>
    </div>
  );
});
