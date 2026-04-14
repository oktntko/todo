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
            <li>
              <RouterLink
                to={{ name: '//mypage/' }}
                class="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                exact-active-class="text-blue-600 border-l-blue-400!"
              >
                <span class="icon-[material-symbols--public] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                <span class="capitalize">profile</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to={{ name: '//mypage/change-password' }}
                class="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                exact-active-class="text-blue-600 border-l-blue-400!"
              >
                <span class="icon-[mdi--password-outline] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                <span class="capitalize">change password</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to={{ name: '//mypage/security' }}
                class="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                exact-active-class="text-blue-600 border-l-blue-400!"
              >
                <span class="icon-[wpf--security-checked] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                <span class="capitalize">security</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to={{ name: '//mypage/notification' }}
                class="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                exact-active-class="text-blue-600 border-l-blue-400!"
              >
                <span class="icon-[bx--notification] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                <span class="capitalize">notification</span>
              </RouterLink>
            </li>
            <li>
              <RouterLink
                to={{ name: '//mypage/account' }}
                class="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
                exact-active-class="text-blue-600 border-l-blue-400!"
              >
                <span class="icon-[codicon--account] h-5 w-5 text-gray-500 group-hover:text-gray-900" />
                <span class="capitalize">account</span>
              </RouterLink>
            </li>
            <li>
              <button
                type="button"
                class="group flex items-center gap-2 rounded-lg rounded-l-none border-l-4 border-l-transparent p-2 hover:bg-gray-100"
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

      <div class="grow">
        <RouterView />
      </div>
    </div>
  );
});
