<script setup lang="ts">
const emit = defineEmits<{
  close: [returnValue?: string | undefined];
}>();

const refDialog = ref<HTMLDialogElement>();
const open = ref(false);

onMounted(() => {
  if (refDialog.value) {
    const dialog = refDialog.value;
    dialog.showModal();

    // ESCキーでキャンセルするとき閉じない
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // cancel イベントを preventDefault しても、なぜか２－３回目ですり抜けてダイアログが消えるため、キーイベントを止める
        e.preventDefault();
      }
    });
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
    });

    open.value = true;
  }
});

function closeDelay(returnValue?: string | undefined) {
  if (refDialog.value) {
    const dialog = refDialog.value;

    dialog.addEventListener(
      'transitionend',
      () => {
        dialog.close();
        emit('close', returnValue);
      },
      { once: true },
    );

    open.value = false;
  } else {
    emit('close', returnValue);
  }
}

defineExpose({
  close: closeDelay,
});
</script>

<template>
  <dialog
    ref="refDialog"
    :class="['flex flex-col items-center bg-transparent outline-none', { open }]"
  >
    <span
      class="icon-[eos-icons--bubble-loading] h-16 w-16 text-gray-600 text-opacity-60 dark:text-gray-800 dark:text-opacity-60"
    ></span>
    <span class="sr-only">Loading...</span>
    <input autofocus class="border-none bg-transparent caret-transparent outline-none" />
  </dialog>
</template>

<style scoped lang="postcss">
/* dialog スタイル https://stackoverflow.com/questions/71744072/how-to-animate-css-backdrop-behind-html-dialog */
dialog {
  @apply transform opacity-0 transition duration-200 ease-out;
}

dialog.open {
  @apply opacity-100;
}

dialog::backdrop,
dialog + .backdrop {
  @apply bg-gray-400/5 opacity-0 backdrop-blur-[1px] transition duration-150 ease-out;
}

dialog.open::backdrop,
dialog.open + .backdrop {
  @apply opacity-100;
}
</style>
