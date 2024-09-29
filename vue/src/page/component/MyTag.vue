<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import type { z } from 'zod';
import type TagSchema from '~/schema/zod/modelSchema/TagSchema';
interface Props extends /* @vue-ignore */ HTMLAttributes {
  tag: Pick<z.infer<typeof TagSchema>, 'tag_name' | 'tag_color'>;
}

defineProps<Props>();
</script>

<template>
  <div
    v-bind="$props"
    class="inline-flex flex-row items-center gap-px rounded-full px-1.5 py-px text-xs"
    :style="{
      color: tag.tag_color,
      backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)',
    }"
  >
    <span class="icon-[mingcute--tag-chevron-fill]"></span>
    <span> {{ tag.tag_name }} </span>
  </div>
</template>
