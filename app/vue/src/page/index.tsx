import { defineComponent, onMounted, ref, Suspense, Transition, type DefineComponent } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';

import { trpc } from '~/lib/trpc';
import { useMypageStore } from '~/store/MypageStore';
import { useSpaceStore } from '~/store/SpaceStore';

export default defineComponent(() => {
  const $router = useRouter();
  const SpaceStore = useSpaceStore();
  const { fetchMypage } = useMypageStore();

  const loading = ref(true);

  onMounted(async () => {
    await SpaceStore.fetchSpace()
      .then(fetchMypage)
      .finally(() => {
        loading.value = false;
      });
  });

  return () => (
    <div class="flex h-dvh">
      {/* sidebar */}
      {!loading.value && (
        <>
          <aside class="flex h-dvh min-h-0 w-56 shrink-0 flex-col gap-6 overflow-y-auto bg-gray-900 p-4 text-gray-50">
            <h1 class="flex items-center gap-1 text-2xl font-semibold">
              <span class="icon-[flat-color-icons--todo-list] h-8 w-8 p-2" />
              <span>MyTodo</span>
            </h1>

            <div class="h-full">
              <ul class="font-medium">
                {SpaceStore.storedSpaceList.map((space) => (
                  <li key={space.space_id}>
                    <div class="flex w-full items-center rounded-lg p-2 text-sm text-gray-500">
                      <span class="icon-[quill--todo] h-4 w-4 text-gray-500" />
                      <span class="ms-2 capitalize">{space.space_name}</span>
                    </div>

                    <ul class="ml-3 border-l border-gray-600">
                      {(
                        [
                          {
                            name: 'list',
                            route: '//space/[space_id]/todo/list',
                            icon: 'icon-[vaadin--list-ol]',
                          },
                          {
                            name: 'table',
                            route: '//space/[space_id]/todo/table/',
                            icon: 'icon-[fontisto--table-2]',
                          },
                          {
                            name: 'board',
                            route: '//space/[space_id]/todo/board',
                            icon: 'icon-[bi--kanban-fill]',
                          },
                          {
                            name: 'calendar',
                            route: '//space/[space_id]/todo/calendar',
                            icon: 'icon-[subway--calendar-2]',
                          },
                          {
                            name: 'whiteboard',
                            route: '//space/[space_id]/whiteboard',
                            icon: 'icon-[hugeicons--whiteboard]',
                          },
                          {
                            name: 'drive',
                            route: '//space/[space_id]/drive/',
                            icon: 'icon-[vaadin--folder-open]',
                          },
                          {
                            name: 'chat',
                            route: '//space/[space_id]/chat/',
                            icon: 'icon-[vaadin--chat]',
                          },
                          {
                            name: 'setting',
                            route: '//space/[space_id]/setting/',
                            icon: 'icon-[uil--setting]',
                          },
                        ] as const
                      ).map((item) => (
                        <li key={item.route}>
                          <RouterLink
                            to={{
                              name: item.route,
                              params: { space_id: space.space_id },
                            }}
                            class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
                            active-class="bg-gray-700"
                          >
                            <span
                              class={`${item.icon} h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white`}
                            />
                            <span class="ms-2 capitalize">{item.name}</span>
                          </RouterLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}

                <li>
                  <RouterLink
                    to={{ name: '//mypage/' }}
                    class="group flex w-full items-center rounded-e-full p-2 pl-3 text-base text-gray-200 transition duration-75 hover:bg-gray-800 hover:text-white"
                    active-class="bg-gray-700"
                  >
                    <span class="icon-[radix-icons--avatar] h-5 w-5 text-gray-200 transition duration-75 group-hover:text-white" />
                    <span class="ms-2 capitalize">my page</span>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </aside>

          {/* main */}
          <div class="flex min-h-0 grow flex-col overflow-y-auto bg-gray-100 text-gray-900">
            <header class="flex h-16 items-center justify-between p-4">
              <nav class="flex items-center">
                <button
                  type="button"
                  class="flex w-48 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-2 py-1 text-sm text-gray-900 transition-colors hover:border-blue-500 hover:bg-white"
                >
                  <span class="icon-[bx--search] h-4 w-4" />
                  <span class="text-gray-500 capitalize">search</span>
                </button>
              </nav>

              <nav class="flex items-center gap-2">
                <button
                  type="button"
                  class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 hover:bg-gray-200"
                  title="bookmark"
                >
                  <span class="icon-[bxs--bookmark] h-5 w-5" />
                  <span class="sr-only capitalize">bookmark</span>
                </button>

                <button
                  type="button"
                  class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 hover:bg-gray-200"
                  title="notification"
                >
                  <span class="icon-[bx--notification] h-5 w-5" />
                  <span class="sr-only capitalize">notification</span>
                </button>

                <button
                  type="button"
                  class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 hover:bg-gray-200"
                  title="avatar"
                  onClick={async () => {
                    await trpc.auth.delete.mutate();
                    return $router.push({ name: '/(auth)/signin' });
                  }}
                >
                  <span class="icon-[radix-icons--avatar] h-5 w-5" />
                  <span class="sr-only capitalize">avatar</span>
                </button>
              </nav>
            </header>

            <div class="grow">
              <RouterView
                v-slots={{
                  default: ({ Component }: { Component?: DefineComponent }) =>
                    Component && (
                      <Transition
                        mode="out-in"
                        enter-from-class="transform opacity-0"
                        enter-active-class="transition ease-out duration-200"
                        enter-to-class="transform opacity-100"
                      >
                        <Suspense>
                          {{
                            default: () => <Component />,
                            fallback: () => (
                              <div class="container flex min-h-dvh grow flex-col items-center justify-center gap-4">
                                <span class="icon-[eos-icons--bubble-loading] text-opacity-60 h-16 w-16 text-gray-600" />
                              </div>
                            ),
                          }}
                        </Suspense>
                      </Transition>
                    ),
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
});
