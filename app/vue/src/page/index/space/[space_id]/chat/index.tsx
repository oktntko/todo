import { R } from '@todo/lib/remeda';
import { storeToRefs } from 'pinia';
import { defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { trpc, type RouterOutput } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useAichatStore } from '~/store/AichatStore';

import Aichat from '../component/Aichat';

export default defineComponent(() => {
  const $route = useRoute('//space/[space_id]/chat');

  const $dialog = useDialog();

  const { storedAichatList } = storeToRefs(useAichatStore());
  const currentAichat = ref<RouterOutput['aichat']['list'][number] | null>(
    storedAichatList.value[0] ?? null,
  );

  watch(currentAichat, (newValue) => {
    if (newValue == null) {
      return;
    }
    const index = storedAichatList.value.findIndex(
      (aichat) => aichat.aichat_id === newValue.aichat_id,
    );

    if (index < 0) {
      return;
    }
    storedAichatList.value[index] = R.omit({ ...newValue, aichat_message_list: [] }, [
      'aichat_message_list',
    ]);
  });

  return () => (
    <div class="flex h-[calc(100vh-64px)] flex-row">
      {/* side */}
      <aside class={['min-h-0 w-56 shrink-0 overflow-y-auto px-2', 'flex flex-col gap-2']}>
        <h1 class="flex items-center gap-1 text-xs text-gray-500">
          <span class="capitalize">aichat</span>
        </h1>

        <div>
          <button
            type="button"
            class="aichat sticky top-0 z-10 flex w-full cursor-pointer items-center gap-1 rounded-e-full bg-gray-200/10 p-2 text-blue-600 backdrop-blur transition duration-75 hover:bg-gray-200"
            onClick={async () => {
              const loading = $dialog.loading();

              try {
                const aichat = await trpc.aichat.create.mutate({
                  space_id: $route.params.space_id,
                  aichat_title: '',
                });

                storedAichatList.value.unshift(aichat);
                currentAichat.value = aichat;
              } finally {
                loading.close();
              }
            }}
          >
            <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
            <span class="capitalize">create new aichat</span>
          </button>

          <ul class="text-sm">
            {storedAichatList.value.map((aichat) => (
              <li
                key={aichat.aichat_id}
                title={aichat.aichat_title || 'No Title'}
                class="rounded-e-full py-px"
              >
                <label
                  class={[
                    'group/item relative flex w-full cursor-pointer items-center justify-start rounded-e-full border-l-[6px] p-1 transition duration-75 hover:bg-gray-200',
                    {
                      'bg-gray-300': currentAichat.value?.aichat_id === aichat.aichat_id,
                    },
                  ]}
                >
                  <input
                    v-model={currentAichat.value}
                    name="aichat"
                    type="radio"
                    value={aichat}
                    class="sr-only"
                  />
                  <span class="mx-1 shrink grow truncate">{aichat.aichat_title || 'No Title'}</span>
                  <button
                    type="button"
                    class={[
                      'group/edit inline-flex justify-center rounded-full p-1 transition-all',
                      'invisible group-hover/item:visible',
                      'hover:bg-gray-300',
                    ]}
                    onClick={async (e) => {
                      e.preventDefault();

                      await $dialog.confirm.warn(`Do you really want to delete this data?`);

                      const loading = $dialog.loading();

                      try {
                        await trpc.aichat.delete.mutate({
                          aichat_id: aichat.aichat_id,
                          updated_at: aichat.updated_at,
                        });

                        storedAichatList.value = storedAichatList.value.filter(
                          (x) => x.aichat_id !== aichat.aichat_id,
                        );

                        if (currentAichat.value?.aichat_id === aichat.aichat_id) {
                          currentAichat.value = storedAichatList.value[0] ?? null;
                        }
                      } finally {
                        loading.close();
                      }
                    }}
                  >
                    <span
                      class={[
                        'icon-[bi--x] h-4 w-4 shrink-0 transition-all',
                        'aichat-hover/edit:scale-125 aichat-hover/edit:text-gray-900',
                      ]}
                    ></span>
                  </button>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* main */}
      {/*
       * w-[calc(100vw-224px-224px-10px)]
       * 224px: グローバルメニュー
       * 224px: GroupList
       */}
      <div
        class={[
          'min-h-0 w-[calc(100vw-224px-224px)] grow-0 overflow-x-auto overflow-y-scroll px-4',
          'pr-56',
        ]}
      >
        <div class="flex h-full w-full flex-row gap-2">
          {currentAichat.value && (
            <Aichat
              key={currentAichat.value.aichat_id}
              class={['shrink-0 break-inside-avoid', 'mx-auto w-2xl']}
              modelValue={currentAichat.value}
              onUpdate:modelValue={(v) => (currentAichat.value = v)}
            />
          )}
        </div>
      </div>
    </div>
  );
});
