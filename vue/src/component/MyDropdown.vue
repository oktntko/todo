<script setup lang="ts">
const showMenu = ref(false);
function toggle() {
  showMenu.value = !showMenu.value;
}

withDefaults(defineProps<{ innerClass?: string }>(), {
  innerClass: '',
});
</script>

<template>
  <div class="relative">
    <OnClickOutside @trigger="() => (showMenu = false)">
      <slot name="button" :toggle="toggle"> </slot>
    </OnClickOutside>

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
        class="absolute right-0 z-10"
        :class="innerClass"
        role="menu"
        aria-orientation="vertical"
        tabindex="-1"
      >
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>
