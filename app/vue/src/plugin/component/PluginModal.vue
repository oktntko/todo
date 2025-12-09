<script setup lang="ts">
const $emit = defineEmits<{
  close: [];
}>();

const refDialog = useTemplateRef<HTMLDialogElement>('refDialog');
const open = ref(false);

onMounted(() => {
  refDialog.value?.showModal();
  open.value = true;
});

function closeDelay() {
  if (refDialog.value) {
    const dialog = refDialog.value;

    dialog.addEventListener('transitionend', (e) => {
      if (e.target === dialog) {
        dialog.close();
        $emit('close');
      }
    });

    open.value = false;
  } else {
    $emit('close');
  }
}
</script>

<template>
  <dialog
    ref="refDialog"
    :class="[
      'm-auto max-w-full min-w-md rounded-lg text-gray-900 shadow-xl outline-hidden',
      { open },
      'translate-y-4 scale-100 transform opacity-0 transition duration-200 ease-out sm:translate-y-4 sm:scale-95',
      '[&.open]:translate-y-0 [&.open]:opacity-100 [&.open]:sm:scale-100',
      'backdrop:bg-gray-400/50 backdrop:opacity-0 backdrop:transition backdrop:duration-200 backdrop:ease-out',
      '[&.open]:backdrop:opacity-100',
    ]"
    @click="
      (e) => {
        // ダイアログの外側がクリックされたとき閉じる
        if (e.target === refDialog) {
          e.preventDefault();
          closeDelay();
        }
      }
    "
    @cancel="
      (e: Event) => {
        // ESCキーでキャンセルするとき閉じる
        if (e.target === refDialog) {
          e.preventDefault();
          closeDelay();
        }
      }
    "
  >
    <slot></slot>

    <button
      type="button"
      class="absolute top-2 right-2 h-6 w-6 cursor-pointer rounded-full bg-transparent text-gray-400 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:text-gray-500 dark:hover:text-white"
      aria-label="Close"
      @click="closeDelay()"
    >
      <span class="icon-[bi--x] h-6 w-6" />
    </button>
  </dialog>
</template>
