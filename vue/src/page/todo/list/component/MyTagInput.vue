<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import MyTag from '~/page/component/MyTag.vue';

export type TagInput = {
  tag_id: number;
  tag_name: string;
  tag_color: string;
  tag_order: number;
};

const props = withDefaults(
  defineProps<{
    editing?: boolean;
    tag_list?: TagInput[];
  }>(),
  {
    editing: false,
    tag_list: () => [],
  },
);

defineEmits<{
  change: [];
}>();

const modelValue = defineModel<Pick<TagInput, 'tag_id'>[]>({ required: true });

const displayTagList = computed(() => {
  return props.tag_list.filter((tag) => modelValue.value.find((x) => x.tag_id === tag.tag_id));
});

const showMenu = ref(false);
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
    <label
      class="relative flex cursor-pointer flex-row flex-wrap gap-1.5 border-b border-b-gray-400 px-px pb-px transition-colors hover:bg-gray-200 sm:text-sm"
      :class="{
        'border-b-gray-400': editing,
        'border-b-transparent': !editing,
      }"
      @click="
        () => {
          if (editing) {
            showMenu = !showMenu;
          } else {
            showMenu = false;
          }
        }
      "
    >
      <MyTag v-for="tag of displayTagList" :key="tag.tag_id" :tag="tag"> </MyTag>
      <div v-if="modelValue.length === 0" class="py-px text-xs text-gray-400">Tag</div>
    </label>

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
        class="absolute right-0 z-10 w-full rounded border border-gray-300 bg-white shadow-md"
        role="menu"
        aria-orientation="vertical"
        tabindex="-1"
      >
        <ul class="flex flex-col">
          <li
            v-for="tag of tag_list"
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
