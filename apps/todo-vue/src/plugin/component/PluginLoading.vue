<script setup lang="ts">
const emit = defineEmits<{
  close: [returnValue?: string | undefined];
}>();

const refDialog = useTemplateRef<HTMLDialogElement>('refDialog');
const open = ref(false);

onMounted(() => {
  refDialog.value?.showModal();
  open.value = true;
});

function closeDelay(returnValue?: string | undefined) {
  if (refDialog.value) {
    const dialog = refDialog.value;

    dialog.addEventListener('transitionend', (e) => {
      if (e.target === dialog) {
        dialog.close();
        emit('close', returnValue);
      }
    });

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
    :class="[
      'relative m-auto flex flex-col items-center bg-transparent outline-hidden',
      { open },
      'transform opacity-0 transition duration-200 ease-out',
      '[&.open]:opacity-100',
      'backdrop:bg-gray-400/5 backdrop:opacity-0 backdrop:backdrop-blur-[1px] backdrop:transition backdrop:duration-150 backdrop:ease-out',
      '[&.open]:backdrop:opacity-100',
    ]"
    @keydown="
      (e) => {
        // ESCキーでキャンセルするとき閉じない
        if (e.key === 'Escape') {
          // cancel イベントを preventDefault しても、なぜか２－３回目ですり抜けてダイアログが消えるため、キーイベントを止める
          e.preventDefault();
        }
      }
    "
    @cancel="
      (e: Event) => {
        // ESCキーでキャンセルするとき閉じない
        e.preventDefault();
      }
    "
  >
    <!-- dialog スタイル https://stackoverflow.com/questions/71744072/how-to-animate-css-backdrop-behind-html-dialog  -->
    <span
      class="icon-[eos-icons--bubble-loading] text-opacity-60 dark:text-opacity-60 h-16 w-16 text-gray-600 dark:text-gray-800"
    ></span>
    <span class="sr-only">Loading...</span>
    <input autofocus class="border-none bg-transparent caret-transparent outline-hidden" />
  </dialog>
</template>
