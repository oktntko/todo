import { R } from '@todo/lib/remeda';
import { useVModel } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import Sortable from 'sortablejs';
import { defineComponent, onMounted } from 'vue';

import { trpc, type RouterOutput } from '~/lib/trpc';
import { satisfiesKeys, type EmitsType } from '~/lib/vue.ts';
import { useDialog } from '~/plugin/DialogPlugin.tsx';
import { useToast } from '~/plugin/ToastPlugin';
import { useGroupStore } from '~/store/GroupStore';

import ModalAddGroup from '../modal/ModalAddGroup.tsx';
import ModalEditGroup from '../modal/ModalEditGroup.tsx';

type Props = {
  modelValue: RouterOutput['group']['list'];
  space_id: string;
  type: 'checkbox' | 'radio';
};
const props = satisfiesKeys<Props>()('modelValue', 'space_id', 'type');

const emits = {
  'update:modelValue': (_: RouterOutput['group']['list']) => true,
} satisfies EmitsType;

export default defineComponent(
  ($props: Props, { emit: $emit }) => {
    const { storedGroupList } = storeToRefs(useGroupStore());

    const checkedGroupList = useVModel($props, 'modelValue', $emit);

    const $toast = useToast();
    const $dialog = useDialog();

    let sortable: Sortable | null = null;
    onMounted(async () => {
      sortable?.destroy();

      const el = document.getElementById(`group-sortable-container`)!;
      sortable = Sortable.create(el, {
        animation: 150,
        group: 'group',

        onEnd(e) {
          if (e.from !== e.to) {
            return;
          }
          if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) {
            return;
          }

          const group = storedGroupList.value[e.oldIndex]!;
          const tail = storedGroupList.value.slice(e.oldIndex + 1);

          storedGroupList.value.splice(e.oldIndex);
          storedGroupList.value.push(...tail);
          storedGroupList.value.splice(e.newIndex, 0, group);

          storedGroupList.value = storedGroupList.value.map((x, i) => ({
            ...x,
            group_order: i,
          }));
          // group_list と同一インスタンスを参照することで v-model にバインドできているので、
          // checked_group_list も更新する
          checkedGroupList.value = storedGroupList.value.filter((x) =>
            checkedGroupList.value.find((y) => y.group_id === x.group_id),
          );

          trpc.group.reorder
            .mutate({
              space_id: $props.space_id,
              order: storedGroupList.value,
            })
            .then(() => {
              $toast.success('Reordered successfully');
            });
        },
      });
    });

    return () => (
      <aside class="flex flex-col gap-2">
        <h1 class="flex items-center gap-1 text-xs text-gray-500">
          <span class="capitalize">group</span>
        </h1>

        <div>
          <ul id="group-sortable-container" class="text-sm">
            {storedGroupList.value.map((group) => (
              <li key={group.group_id} class="rounded-e-full py-px">
                <label
                  class={[
                    'group/item relative flex w-full cursor-pointer items-center justify-start rounded-e-full border-l-[6px] p-1 transition duration-75 hover:bg-gray-200',
                    {
                      'bg-gray-300': ~checkedGroupList.value.findIndex(
                        (x) => x.group_id === group.group_id,
                      ),
                    },
                  ]}
                  style={{
                    'border-left-color': group.group_color,
                  }}
                >
                  <input
                    v-model={checkedGroupList.value}
                    name="group"
                    type={$props.type}
                    value={$props.type === 'checkbox' ? group : [group]}
                    class="sr-only"
                    onChange={() => {
                      // checkbox だと後ろに追加されるので group_order で並び替える
                      checkedGroupList.value = R.sortBy(
                        checkedGroupList.value,
                        (x) => x.group_order,
                      );
                    }}
                  />
                  {group.group_image ? (
                    <img
                      src={group.group_image}
                      width="16"
                      height="16"
                      decoding="async"
                      class="h-4 w-4 shrink-0 rounded-sm object-cover object-center"
                    />
                  ) : (
                    <span class="icon-[ri--image-circle-fill] h-4 w-4 shrink-0"></span>
                  )}

                  <span class="mx-1 shrink grow truncate">{group.group_name}</span>
                  <button
                    type="button"
                    class={[
                      'group/edit inline-flex justify-center rounded-full p-1 transition-all',
                      'invisible group-hover/item:visible',
                      'hover:bg-gray-300',
                    ]}
                    onClick={async (e) => {
                      e.preventDefault();

                      await $dialog.showModal(ModalEditGroup, (resolve) => ({
                        group_id: group.group_id,
                        onDone: resolve,
                      }));

                      // group_list と同一インスタンスを参照することで v-model にバインドできているので、
                      // checked_group_list も更新する
                      checkedGroupList.value = storedGroupList.value.filter((x) =>
                        checkedGroupList.value.find((y) => y.group_id === x.group_id),
                      );
                    }}
                  >
                    <span
                      class={[
                        'icon-[bx--menu] h-4 w-4 shrink-0 transition-all',
                        'group-hover/edit:scale-125 group-hover/edit:text-gray-900',
                      ]}
                    ></span>
                  </button>
                </label>
              </li>
            ))}
          </ul>

          <button
            type="button"
            class="group sticky bottom-0 flex w-full cursor-pointer items-center rounded-e-full bg-gray-200/10 p-2 text-blue-600 backdrop-blur transition duration-75 hover:bg-gray-200"
            onClick={async () => {
              await $dialog.showModal(ModalAddGroup, (resolve) => ({
                space_id: $props.space_id,
                onDone: resolve,
              }));
            }}
          >
            <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
            <span class="ms-1 capitalize">create new group</span>
          </button>
        </div>
      </aside>
    );
  },
  {
    props,
    emits,
  },
);
