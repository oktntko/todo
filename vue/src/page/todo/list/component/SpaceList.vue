<script setup lang="ts">
import * as R from 'remeda';
import { useValidate } from '~/composable/useValidate';
import { trpc, type RouterOutput } from '~/lib/trpc';
import type { z } from '~/lib/zod';
import ModalAddSpace from '~/page/todo/list/modal/ModalAddSpace.vue';
import { SpaceRouterSchema } from '~/schema/SpaceRouterSchema';

const router = useRouter();

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

const data = ref<RouterOutput['space']['list']>();
const loading = ref(true);

const handleSubmit = validateSubmit(async () => {
  loading.value = true;
  try {
    data.value = await trpc.space.list.query(modelValue.value);
  } finally {
    loading.value = false;
  }
});

onMounted(async () => {
  await handleSubmit();

  if (data.value && data.value.space_list.length > 0) {
    router.replace({
      name: '/todo/list/[space_id]',
      params: { space_id: data.value.space_list[0].space_id },
    });
  }
});

const debounce = R.debounce(handleSubmit, { waitMs: 500 });
watchDeep(modelValue, () => debounce.call());
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
        class="inline-block w-full rounded-s-lg border border-gray-300 bg-white py-1 pe-2 ps-6 text-gray-900"
        maxlength="255"
      />
      <button
        type="button"
        class="inline-flex items-center rounded-e-lg border-y border-e border-gray-300 bg-white p-1.5"
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

    <Transition
      mode="out-in"
      enter-from-class="transform opacity-0"
      enter-active-class="transition ease-out duration-200"
      enter-to-class="transform opacity-100"
    >
      <template v-if="data">
        <ul class="text-sm">
          <li v-for="space of data.space_list" :key="space.space_id">
            <RouterLink
              class="group relative flex w-full items-center rounded-e-full p-2 transition duration-75 hover:bg-gray-200"
              exact-active-class="bg-gray-300"
              :to="{
                name: '/todo/list/[space_id]',
                params: { space_id: space.space_id },
              }"
            >
              <img
                v-if="space.space_image"
                :src="space.space_image"
                width="16"
                height="16"
                decoding="async"
                class="h-4 w-4 rounded object-cover object-center"
              />
              <span v-else class="icon-[ri--image-circle-fill] h-4 w-4"></span>
              <span class="ms-1">{{ space.space_name }}</span>
            </RouterLink>
          </li>
          <li>
            <button
              type="button"
              class="group flex w-full items-center rounded-e-full p-2 text-blue-600 transition duration-75 hover:bg-gray-200"
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
          </li>
        </ul>
      </template>
      <template v-else>
        <MyLoading class="flex grow flex-col gap-8" />
      </template>
    </Transition>
  </aside>
</template>
