<template>
  <ul>
    <template v-for="(child, i) in $slots.default?.() ?? []" :key="i">
      <li class="inline-flex items-center">
        <!-- VNode をそのまま描画 -->
        <component :is="child" />
      </li>

      <!-- 区切り（最後以外） -->
      <li v-if="i !== ($slots.default?.() ?? []).length - 1" class="inline-flex items-center">
        <slot name="separator">
          <span class="icon-[weui--arrow-filled]"></span>
        </slot>
      </li>
    </template>
  </ul>
</template>
