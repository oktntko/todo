import { dayjs } from '@todo/lib/dayjs';
import Sortable from 'sortablejs';
import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { trpc, type RouterOutput } from '~/lib/trpc';
import { useDialog } from '~/plugin/DialogPlugin';
import { useToast } from '~/plugin/ToastPlugin';

import WhiteboardCanvas from './component/WhiteboardCanvas.tsx';
import ModalEditWhiteboard, {
  type ModalEditWhiteboardResult,
} from './modal/ModalEditWhiteboard.tsx';

export default defineComponent(async () => {
  const $route = useRoute('//space/[space_id]/whiteboard');
  const $toast = useToast();
  const $dialog = useDialog();

  let sortable: Sortable | null = null;
  onMounted(() => {
    sortable?.destroy();

    const el = document.getElementById('whiteboard-sortable-container')!;
    sortable = Sortable.create(el, {
      animation: 150,
      group: 'whiteboard',

      onEnd(e) {
        if (e.from !== e.to) {
          return;
        }
        if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) {
          return;
        }

        const whiteboard = whiteboard_list.value[e.oldIndex]!;
        const tail = whiteboard_list.value.slice(e.oldIndex + 1);

        whiteboard_list.value.splice(e.oldIndex);
        whiteboard_list.value.push(...tail);
        whiteboard_list.value.splice(e.newIndex, 0, whiteboard);

        whiteboard_list.value = whiteboard_list.value.map((x, i) => ({
          ...x,
          whiteboard_order: i,
        }));

        void trpc.whiteboard.reorder
          .mutate({
            space_id: $route.params.space_id,
            order: whiteboard_list.value,
          })
          .then(() => {
            $toast.success('Reordered successfully');
          });
      },
    });

    currentWhiteboard.value = whiteboard_list.value[0];
  });

  const whiteboard_list = ref<RouterOutput['whiteboard']['list']>(
    await trpc.whiteboard.list.query({
      space_id: $route.params.space_id,
    }),
  );

  const currentWhiteboard = ref<RouterOutput['whiteboard']['get']>();

  return () => (
    <div class="flex flex-row">
      {/* sidebar */}
      <div class="flex h-[calc(100vh-64px)] w-56 shrink-0 flex-col gap-4 px-2 pb-2">
        <div class="grow overflow-y-auto">
          <aside class="flex flex-col gap-2">
            <h1 class="flex items-center gap-1 text-xs text-gray-500">
              <span class="capitalize">whiteboard</span>
            </h1>

            <ul id="whiteboard-sortable-container" class="text-sm">
              {whiteboard_list.value.map((whiteboard) => (
                <li key={whiteboard.whiteboard_id} class="rounded-e-full py-px">
                  <label
                    class={[
                      'group/item relative flex w-full cursor-pointer items-center justify-start rounded-e-full border-l-[6px] p-1 transition hover:bg-gray-200',
                      currentWhiteboard.value?.whiteboard_id === whiteboard.whiteboard_id &&
                        'bg-gray-300',
                    ]}
                  >
                    <button
                      class="sr-only"
                      onClick={() => {
                        currentWhiteboard.value = whiteboard;
                      }}
                    />

                    <span class="mx-1 shrink grow truncate">{whiteboard.whiteboard_name}</span>

                    <button
                      type="button"
                      class={[
                        'group/edit inline-flex justify-center rounded-full p-1 transition-all',
                        'opacity-0 group-hover/item:opacity-100',
                        'hover:bg-gray-300',
                      ]}
                      onClick={async (e) => {
                        e.preventDefault();

                        const result: ModalEditWhiteboardResult = await $dialog.showModal(
                          ModalEditWhiteboard,
                          (resolve) => ({
                            whiteboard_id: whiteboard.whiteboard_id,
                            onDone: resolve,
                          }),
                        );

                        const index = whiteboard_list.value.findIndex(
                          (x) => x.whiteboard_id === result.whiteboard.whiteboard_id,
                        );

                        if (result.event === 'delete') {
                          whiteboard_list.value.splice(index, 1);
                          currentWhiteboard.value = whiteboard_list.value[0];
                        } else {
                          whiteboard_list.value.splice(index, 1, result.whiteboard);
                          currentWhiteboard.value = result.whiteboard;
                        }
                      }}
                    >
                      <span class="icon-[bx--menu] h-4 w-4 transition-all group-hover/edit:scale-125 group-hover/edit:text-gray-900" />
                    </button>
                  </label>
                </li>
              ))}
            </ul>

            <button
              type="button"
              class="group sticky bottom-0 flex w-full items-center gap-1 rounded-e-full bg-gray-200/10 p-2 text-blue-600 backdrop-blur transition hover:bg-gray-200"
              onClick={async () => {
                const loading = $dialog.loading();
                try {
                  const whiteboard = await trpc.whiteboard.create.mutate({
                    space_id: $route.params.space_id,
                    whiteboard_name: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    whiteboard_content: '{}',
                    whiteboard_description: '',
                  });

                  whiteboard_list.value.push(whiteboard);
                  currentWhiteboard.value = whiteboard;
                } finally {
                  loading.close();
                }
              }}
            >
              <span class="icon-[icon-park-solid--add-one] h-4 w-4" />
              <span class="capitalize">create new canvas</span>
            </button>
          </aside>
        </div>

        {/* 編集 */}
        <div id="whiteboard-edit" class="grid shrink-0 grid-cols-2 flex-col gap-2"></div>

        {/* ミニマップ */}
        <div id="whiteboard-minimap" class="flex shrink-0 flex-col gap-2"></div>
      </div>

      {/* main */}
      <div class="h-[calc(100vh-64px)] w-[calc(100vw-224px-224px-10px)] overflow-x-auto">
        {currentWhiteboard.value && (
          <WhiteboardCanvas
            key={currentWhiteboard.value.whiteboard_id}
            modelValue={currentWhiteboard.value}
            onUpdate:modelValue={(v) => (currentWhiteboard.value = v)}
          />
        )}
      </div>
    </div>
  );
});
