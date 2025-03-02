<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { useTagStore } from '~/store/TagStore';

const { tagStoreData } = storeToRefs(useTagStore());

const modelValue = defineModel<Pick<{ tag_id: number }, 'tag_id'>[]>({ required: true });

const showMenu = ref(false);
function toggle(params?: { showMenu: boolean }) {
  showMenu.value = params ? params.showMenu : !showMenu.value;
}

defineEmits<{
  change: [];
}>();

const displayTagList = computed(() =>
  tagStoreData.value.tag_list.filter((tag) =>
    modelValue.value.find((x) => x.tag_id === tag.tag_id),
  ),
);
</script>

<template>
  <div
    v-on-click-outside="
      () => {
        showMenu = false;
      }
    "
    class="relative block"
  >
    <slot name="input" :toggle="toggle" :display-tag-list="displayTagList"> </slot>

    <Transition
      enter-from-class="transform opacity-0 scale-95"
      enter-active-class="transition ease-out duration-100"
      enter-to-class="transform opacity-100 scale-100"
      leave-from-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="showMenu"
        class="absolute right-0 z-10 w-full"
        role="menu"
        aria-orientation="vertical"
        tabindex="-1"
      >
        <ul class="rounded-sm border border-gray-300 bg-white shadow-md">
          <li
            v-for="tag of tagStoreData.tag_list"
            :key="tag.tag_id"
            class="flex cursor-pointer items-center justify-between px-1.5 py-1 hover:bg-gray-100"
            :class="{
              'bg-blue-100': !!modelValue.find((x) => x.tag_id === tag.tag_id),
              'hover:bg-blue-200': !!modelValue.find((x) => x.tag_id === tag.tag_id),
            }"
            @click="
              () => {
                const index = modelValue.findIndex((x) => x.tag_id === tag.tag_id);
                if (index >= 0) {
                  modelValue.splice(index, 1);
                } else {
                  modelValue.push(tag);
                }
                $emit('change');
              }
            "
          >
            <div class="inline-flex flex-row items-center gap-1 text-sm">
              <span
                class="icon-[mingcute--tag-chevron-fill]"
                :style="{
                  color: tag.tag_color,
                }"
              ></span>
              <span> {{ tag.tag_name }} </span>
            </div>
            <input type="checkbox" :checked="!!modelValue.find((x) => x.tag_id === tag.tag_id)" />
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
