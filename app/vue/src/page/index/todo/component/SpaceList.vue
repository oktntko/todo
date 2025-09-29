<script setup lang="ts">
import { R } from '@todo/lib/remeda';
import Sortable from 'sortablejs';
import { trpc, type RouterOutput } from '~/lib/trpc';
import ModalAddSpace from '~/page/index/todo/modal/ModalAddSpace.vue';
import { useToast } from '~/plugin/ToastPlugin';
import { useSpaceStore } from '~/store/SpaceStore';

const { storedSpaceList } = storeToRefs(useSpaceStore());

defineProps<{
  type: 'checkbox' | 'radio';
}>();
const checkedSpaceList = defineModel<RouterOutput['space']['list']>({
  required: true,
});

const $toast = useToast();

let sortable: Sortable | null = null;
onMounted(async () => {
  sortable?.destroy();

  const el = document.getElementById(`space-sortable-container`)!;
  sortable = Sortable.create(el, {
    animation: 150,
    group: 'space',

    onEnd(e) {
      if (e.from !== e.to) {
        return;
      }
      if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) {
        return;
      }

      const space = storedSpaceList.value[e.oldIndex]!;
      const tail = storedSpaceList.value.slice(e.oldIndex + 1);

      storedSpaceList.value.splice(e.oldIndex);
      storedSpaceList.value.push(...tail);
      storedSpaceList.value.splice(e.newIndex, 0, space);

      storedSpaceList.value = storedSpaceList.value.map((x, i) => ({
        ...x,
        space_order: i,
      }));
      // space_list と同一インスタンスを参照することで v-model にバインドできているので、
      // checked_space_list も更新する
      checkedSpaceList.value = storedSpaceList.value.filter((x) =>
        checkedSpaceList.value.find((y) => y.space_id === x.space_id),
      );

      trpc.space.reorder.mutate(storedSpaceList.value).then(() => {
        $toast.success('Reordered successfully');
      });
    },
  });
});
</script>

<template>
  <aside class="flex flex-col gap-2">
    <h1 class="flex items-center gap-1 text-xs text-gray-500">
      <span class="capitalize">space</span>
    </h1>

    <div>
      <ul id="space-sortable-container" class="text-sm">
        <li v-for="space of storedSpaceList" :key="space.space_id" class="rounded-e-full py-px">
          <label
            class="group relative flex w-full cursor-pointer items-center justify-start rounded-e-full p-2 transition duration-75 hover:bg-gray-200"
            :class="{
              'bg-gray-300': ~checkedSpaceList.findIndex((x) => x.space_id === space.space_id),
            }"
          >
            <input
              v-model="checkedSpaceList"
              :type="type"
              :value="type === 'checkbox' ? space : [space]"
              class="sr-only"
              @change="
                () => {
                  // checkbox だと後ろに追加されるので space_order で並び替える
                  checkedSpaceList = R.sortBy(checkedSpaceList, (x) => x.space_order);
                }
              "
            />
            <img
              v-if="space.space_image"
              :src="space.space_image"
              width="16"
              height="16"
              decoding="async"
              class="h-4 w-4 shrink-0 rounded-sm object-cover object-center"
            />
            <span v-else class="icon-[ri--image-circle-fill] h-4 w-4 shrink-0"></span>
            <span class="ms-1 shrink truncate">{{ space.space_name }}</span>
          </label>
        </li>
      </ul>
      <button
        type="button"
        class="group flex w-full cursor-pointer items-center rounded-e-full p-2 text-blue-600 transition duration-75 hover:bg-gray-200"
        @click="
          async () => {
            return $modal.open<RouterOutput['space']['create']>({
              component: ModalAddSpace,
            });
          }
        "
      >
        <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
        <span class="ms-1 capitalize">create new space</span>
      </button>
    </div>
  </aside>
</template>
