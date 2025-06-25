<script setup lang="ts">
import * as R from 'remeda';
import Sortable from 'sortablejs';
import { useValidate } from '~/composable/useValidate';
import { trpc, type RouterOutput } from '~/lib/trpc';
import type { z } from '~/lib/zod';
import ModalAddSpace from '~/page/todo/modal/ModalAddSpace.vue';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';

const props = defineProps<{
  type: 'checkbox' | 'radio';
}>();
const space_list = defineModel<RouterOutput['space']['list']['space_list']>('space_list', {
  required: true,
});

const modelValue = ref<z.infer<typeof SpaceRouterSchema.listInput>>({
  where: {
    space_keyword: '',
  },
  sort: {
    field: 'space_order',
    order: 'asc',
  },
});

const { validateSubmit } = useValidate(SpaceRouterSchema.listInput, modelValue);

const data = ref<RouterOutput['space']['list']>({
  space_list: [],
  total: 0,
});
const loading = ref(true);

const handleSubmit = validateSubmit(async () => {
  loading.value = true;
  try {
    data.value = await trpc.space.list.query(modelValue.value);
  } finally {
    loading.value = false;
  }
});

const sortable = ref<Sortable>();
onMounted(async () => {
  sortable.value?.destroy();

  await handleSubmit();

  space_list.value = R.take(
    data.value?.space_list ?? [],
    props.type === 'radio' ? 1 : (data.value?.space_list.length ?? 0),
  );

  const el = document.getElementById(`space-sortable-container`)!;
  sortable.value = Sortable.create(el, {
    animation: 150,
    group: 'space',

    onEnd(e) {
      if (!data.value) {
        return;
      }
      if (e.from !== e.to) {
        return;
      }
      if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) {
        return;
      }

      const space = data.value.space_list[e.oldIndex];
      const tail = data.value.space_list.slice(e.oldIndex + 1);

      data.value.space_list.splice(e.oldIndex);
      data.value.space_list.push(...tail);
      data.value.space_list.splice(e.newIndex, 0, space);

      const space_list =
        modelValue.value.sort.order === 'asc'
          ? [...data.value.space_list]
          : data.value.space_list.toReversed();

      trpc.space.reorder.mutate(
        space_list.map((x, i) => ({
          space_id: x.space_id,
          space_order: i + 1,
        })),
      );
    },
  });
});

const debouncer = R.funnel(handleSubmit, { minQuietPeriodMs: 500 });
watchDeep(modelValue, () => debouncer.call());
</script>

<template>
  <aside class="flex flex-col gap-2 px-4">
    <h1 class="flex items-center gap-1 text-xs text-gray-500">
      <span class="capitalize">space</span>
    </h1>

    <form class="relative flex flex-row items-center text-sm" @submit.prevent="handleSubmit">
      <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2">
        <span class="icon-[line-md--filter] h-4 w-4 text-gray-500"></span>
      </div>
      <input
        v-model="modelValue.where.space_keyword"
        class="inline-block w-full rounded-s-lg border border-gray-300 bg-white py-1 ps-6 pe-2 text-gray-900"
        maxlength="255"
      />
      <button
        type="button"
        class="inline-flex cursor-pointer items-center rounded-e-lg border-y border-e border-gray-300 bg-white p-1.5"
        @click="
          () => {
            modelValue.sort.order = modelValue.sort.order === 'desc' ? 'asc' : 'desc';
          }
        "
      >
        <span
          v-if="modelValue.sort.order === 'desc'"
          class="icon-[hugeicons--sorting-01] h-4 w-4"
        ></span
        ><span v-else class="icon-[hugeicons--sorting-02] h-4 w-4"></span>
      </button>
    </form>

    <div>
      <ul id="space-sortable-container" class="text-sm">
        <li v-for="space of data.space_list" :key="space.space_id" class="rounded-e-full py-px">
          <label
            class="group relative flex w-full cursor-pointer items-center justify-between rounded-e-full p-2 transition duration-75 hover:bg-gray-200"
            :class="{
              'bg-gray-300': ~space_list.findIndex((x) => x.space_id === space.space_id),
            }"
          >
            <input
              v-model="space_list"
              :type="type"
              :value="type === 'checkbox' ? space : [space]"
              class="sr-only"
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
            <span class="grow text-right" :class="[type !== 'checkbox' ? 'invisible' : '']">
              {{
                (function () {
                  const index = space_list.findIndex((x) => x.space_id === space.space_id);
                  return index >= 0 ? index + 1 : '';
                })()
              }}
            </span>
          </label>
        </li>
      </ul>
      <button
        type="button"
        class="group flex w-full cursor-pointer items-center rounded-e-full p-2 text-blue-600 transition duration-75 hover:bg-gray-200"
        @click="
          async () => {
            if (data == null) return;

            const space = await $modal.open<RouterOutput['space']['create']>({
              component: ModalAddSpace,
            });

            if (space) {
              data.space_list.push(space);
            }
          }
        "
      >
        <span class="icon-[icon-park-solid--add-one] h-4 w-4"></span>
        <span class="ms-1 capitalize">create new space</span>
      </button>
    </div>
  </aside>
</template>
