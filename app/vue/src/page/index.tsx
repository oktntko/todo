import { dayjs } from '@todo/lib/dayjs';
import { defineComponent, onMounted, ref, Suspense, Transition, type DefineComponent } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

import type { MyDropdownSlots } from '~/component/type';

import MyDropdown from '~/component/MyDropdown.vue';
import { useMypageStore } from '~/store/MypageStore';
import { useNotificationStore } from '~/store/NotificationStore';
import { useSpaceStore } from '~/store/SpaceStore';

export default defineComponent(() => {
  const SpaceStore = useSpaceStore();
  const { fetchMypage } = useMypageStore();
  const NotificationStore = useNotificationStore();

  const loading = ref(true);

  onMounted(async () => {
    await SpaceStore.fetchSpace()
      .then(fetchMypage)
      .then(NotificationStore.fetchNotification)
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
                    <div class="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-gray-500">
                      <span class="icon-[quill--todo] h-4 w-4 text-gray-500" />
                      <span class="capitalize">{space.space_name}</span>
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
                            class="group flex w-full items-center gap-2 rounded-e-full p-2 pl-3 text-base text-gray-200 transition hover:bg-gray-800 hover:text-white"
                            active-class="bg-gray-700"
                          >
                            <span
                              class={`${item.icon} h-5 w-5 text-gray-200 transition group-hover:text-white`}
                            />
                            <span class="capitalize">{item.name}</span>
                          </RouterLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
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
                  class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
                  title="bookmark"
                >
                  <span class="icon-[bxs--bookmark] h-5 w-5" />
                  <span class="sr-only capitalize">bookmark</span>
                </button>
                <MyDropdown
                  class="z-100"
                  v-slots={
                    {
                      button: ({ toggle }) => (
                        <button
                          type="button"
                          class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
                          title="notification"
                          onClick={toggle}
                        >
                          {NotificationStore.unreadCount > 0 && (
                            <div class="absolute top-0 right-0 min-w-4 translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-white bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                              {NotificationStore.unreadCount > 99
                                ? '99+'
                                : NotificationStore.unreadCount}
                            </div>
                          )}
                          <span class="icon-[bx--notification] h-5 w-5" />
                          <span class="sr-only capitalize">notification</span>
                        </button>
                      ),

                      default: () => (
                        <div class="w-96 divide-gray-200 rounded-sm border border-gray-300 bg-white shadow-md">
                          <h1 class="flex items-center gap-2 p-2 text-xs text-gray-500">
                            <span class="capitalize">notification</span>
                          </h1>

                          <ul>
                            {NotificationStore.unreadNotificationList.length > 0 ? (
                              NotificationStore.unreadNotificationList.map((x) => (
                                <li key={x.notification_id}>
                                  <a
                                    href={x.notification_link}
                                    class="flex items-center gap-1 p-2 transition-all hover:bg-gray-200"
                                    onClick={() => {
                                      void NotificationStore.readNotification(x.notification_id);
                                    }}
                                  >
                                    <div>
                                      <span
                                        class={[
                                          'relative h-6 w-6',
                                          x.type === 'todo'
                                            ? 'icon-[flat-color-icons--todo-list]'
                                            : 'icon-[fluent-emoji-flat--bell]',
                                        ]}
                                      />
                                    </div>

                                    <div class="grow">
                                      <div class="bold line-clamp-2">{x.notification_title}</div>
                                      <div class="line-clamp-4 text-xs whitespace-pre-wrap text-gray-600">
                                        {x.notification_body}
                                      </div>
                                      <div class="text-xs text-gray-400">
                                        {dayjs(x.notification_at).format('YYYY-MM-DD hh:mm')}
                                      </div>
                                    </div>
                                  </a>
                                </li>
                              ))
                            ) : (
                              <li class="flex p-2 capitalize">nothing to do!</li>
                            )}
                          </ul>

                          <div class="flex items-center justify-center p-2 text-sm">
                            <RouterLink
                              to={{
                                name: '//mypage/notification',
                              }}
                              class="font-medium text-blue-600 hover:underline"
                            >
                              <span class="capitalize">view all notification</span>
                            </RouterLink>
                          </div>
                        </div>
                      ),
                    } satisfies MyDropdownSlots
                  }
                ></MyDropdown>

                <RouterLink
                  to={{ name: '//mypage/' }}
                  class="relative flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors hover:bg-gray-200"
                >
                  <span class="icon-[radix-icons--avatar] h-5 w-5" />
                  <span class="sr-only capitalize">mypage</span>
                </RouterLink>
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
