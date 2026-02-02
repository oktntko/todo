import { dayjs } from '@todo/lib/dayjs';
import Sortable from 'sortablejs';
import { trpc, type RouterOutput } from '~/lib/trpc';
import { useToast } from '~/plugin/ToastPlugin';
import WhiteboardCanvas from './component/WhiteboardCanvas.vue';
import ModalEditWhiteboard, {
  type ModalEditWhiteboardResult,
} from './modal/ModalEditWhiteboard.vue';

const $route = useRoute('//space/[space_id]/whiteboard');

const whiteboard_list = ref(await trpc.whiteboard.list.query());
const currentWhiteboard = ref<RouterOutput['whiteboard']['get']>();

const $toast = useToast();

let sortable: Sortable | null = null;
onMounted(() => {
  sortable?.destroy();

  const el = document.getElementById(`whiteboard-sortable-container`)!;
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

      trpc.whiteboard.reorder
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

(
  <div class="flex flex-row">
    <div class="flex h-[calc(100vh-64px)] w-56 shrink-0 flex-col gap-4 px-2 pb-2">
      <!-- ステータス -->
      <div class="grow overflow-y-auto">
        <aside class="flex flex-col gap-2">
          <h1 class="flex items-center gap-1 text-xs text-gray-500">
            <span class="capitalize">whiteboard</span>
          </h1>

          <div>
            <ul id="whiteboard-sortable-container" class="text-sm">
              <li
                v-for="whiteboard of whiteboard_list"
                :key="whiteboard.whiteboard_id"
                class="rounded-e-full py-px"
              >
                <label
                  :for="whiteboard.whiteboard_id.toString()"
                  class="group/item relative flex w-full cursor-pointer items-center justify-start rounded-e-full p-1 transition duration-75 hover:bg-gray-200"
                  :class="[
                    {
                      'bg-gray-300': currentWhiteboard?.whiteboard_id === whiteboard.whiteboard_id,
                    },
                    `border-l-[6px]`,
                  ]"
                >
                  <button
                    :id="whiteboard.whiteboard_id.toString()"
                    name="whiteboard"
                    class="sr-only"
                    @click="currentWhiteboard = whiteboard"
                  />
                  <span class="mx-1 shrink grow truncate">{{ whiteboard.whiteboard_name }}</span>
                  <button
                    type="button"
                    class="group/edit inline-flex justify-center rounded-full p-1 transition-all"
                    :class="['invisible group-hover/item:visible', 'hover:bg-gray-300']"
                    @click.prevent="
                      async () => {
                        const result: ModalEditWhiteboardResult = await $dialog.showModal(
                          ModalEditWhiteboard,
                          (resolve) => ({
                            whiteboard_id: whiteboard.whiteboard_id,
                            onDone: resolve,
                          }),
                        );

                        const index = whiteboard_list.findIndex(
                          (x) => x.whiteboard_id === result.whiteboard.whiteboard_id,
                        );

                        if (result.event === 'delete') {
                          whiteboard_list.splice(index, 1);
                          currentWhiteboard =
                            whiteboard_list.length > 0 ? whiteboard_list[0] : undefined;
                        } else {
                          whiteboard_list.splice(index, 1, result.whiteboard);
                          currentWhiteboard = result.whiteboard;
                        }
                      }
                    "
                  >
                    <span
                      class="icon-[bx--menu] h-4 w-4 shrink-0 transition-all"
                      :class="['group-hover/edit:scale-125 group-hover/edit:text-gray-900']"
                    ></span>
                  </button>
                </label>
              </li>
            </ul>

            <button
              type="button"
              class="group sticky bottom-0 flex w-full cursor-pointer items-center rounded-e-full bg-gray-200/10 p-2 text-blue-600 backdrop-blur transition duration-75 hover:bg-gray-200"
              @click="
                async () => {
                  const loading = $dialog.loading();
                  try {
                    const whiteboard = await trpc.whiteboard.create.mutate({
                      space_id: $route.params.space_id,
                      whiteboard_name: dayjs().format('YYYY-MM-DD hh:mm:ss'),
                      whiteboard_content: '{}',
                      whiteboard_description: '',
                    });

                    currentWhiteboard = whiteboard;
                    whiteboard_list.push(whiteboard);
                  } finally {
                    loading.close();
                  }
                }
              "
            >
              <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
              <span class="ms-1 capitalize">create new canvas</span>
            </button>
          </div>
        </aside>
      </div>

      <!-- 編集 -->
      <div id="whiteboard-edit" class="grid shrink-0 grid-cols-2 flex-col gap-2"></div>

      <!-- ミニマップ -->
      <div id="whiteboard-minimap" class="flex shrink-0 flex-col gap-2"></div>
    </div>

    <div class="h-[calc(100vh-64px)] w-[calc(100vw-224px-224px-10px)] grow-0 overflow-x-auto">
      <WhiteboardCanvas
        v-if="currentWhiteboard"
        :key="currentWhiteboard.whiteboard_id"
        v-model="currentWhiteboard"
      ></WhiteboardCanvas>
    </div>
  </div>
)
