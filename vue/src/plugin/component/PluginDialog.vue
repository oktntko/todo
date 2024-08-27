<script setup lang="ts">
const CONFIRMED_VALUE = 'confirmed';

withDefaults(
  defineProps<{
    title?: string;
    icon?: string;
    colorset?: 'blue' | 'green' | 'yellow' | 'red';
    message: string;
    confirmText?: string;
    cancelText?: string;
    autofocus?: 'confirm' | 'cancel';
  }>(),
  {
    title: '',
    icon: '',
    colorset: 'blue',
    confirmText: '',
    cancelText: '',
    autofocus: 'cancel',
  },
);

const emit = defineEmits<{
  close: [ok: boolean];
}>();

const refDialog = ref<HTMLDialogElement>();
const open = ref(false);

onMounted(() => {
  if (refDialog.value) {
    const dialog = refDialog.value;
    dialog.showModal();

    // ESCキーでキャンセルするとき閉じる
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeDelay();
    });

    // ダイアログの外側がクリックされたとき閉じる
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        closeDelay();
      }
    });

    open.value = true;
  }
});

/**
 * <dialog> を閉じる方法
 * 1. Escキーによる
 *    - Escキーを押すとダイアログが閉じる
 *    - ＜イベント＞ HTMLDialogElement cancel => close(returnValue は空文字(string))
 * 2. <form method="dialog">
 *    - submit ボタンがクリックされたときにダイアログが閉じる
 *    - HTMLDialogElement.returnValue プロパティに submit ボタンの value が設定される
 *      - value が設定されていないボタンをクリックしたとき、 returnValue は空文字(string)
 *    - ＜イベント＞ HTMLDialogElement submit => close(returnValue が取得できる)
 *    ↑ HTMLだけで完結するので、この方法が一番簡単だけど、 <Transition> との兼ね合いで `.close()` メソッド を使っている
 * 3. `.close()` メソッド
 *    - `.close()` メソッドを実行するとダイアログが閉じる
 *    - `.close()`の引数に returnValue を渡すことができる。 引数を渡さなかったとき(undefined)でも、 returnValueは空文字
 *    - ＜イベント＞ HTMLDialogElement close(returnValue は空文字(string))
 */

function closeDelay(returnValue?: typeof CONFIRMED_VALUE | undefined) {
  if (refDialog.value) {
    const dialog = refDialog.value;

    dialog.addEventListener(
      'transitionend',
      () => {
        dialog.close();
        emit('close', returnValue === CONFIRMED_VALUE);
      },
      { once: true },
    );

    open.value = false;
  } else {
    emit('close', returnValue === CONFIRMED_VALUE);
  }
}
</script>

<template>
  <dialog ref="refDialog" :class="['max-w-xl rounded-lg shadow-xl outline-none', { open }]">
    <form method="dialog">
      <header
        v-if="title"
        class="flex items-start justify-between border-b border-gray-200 px-4 py-3"
      >
        <h3>{{ title }}</h3>
      </header>

      <main class="flex items-start gap-4 px-4 py-6">
        <div
          v-if="icon"
          class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
          :class="{
            'bg-green-100 text-green-600' /*   */: colorset === 'green',
            'bg-yellow-100 text-yellow-600' /* */: colorset === 'yellow',
            'bg-red-100 text-red-600' /*       */: colorset === 'red',
            'bg-blue-100 text-blue-600' /*     */: colorset === 'blue',
          }"
        >
          <span :class="['h-6 w-6', icon]"></span>
        </div>

        <div>
          <p class="whitespace-pre-wrap text-sm text-gray-500">
            {{ message }}
          </p>
        </div>
      </main>

      <footer class="flex gap-4 bg-gray-50 px-4 py-3">
        <div
          v-if="icon"
          class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
        ></div>
        <button
          v-if="confirmText"
          type="button"
          :class="[
            'inline-flex items-center justify-center shadow-sm transition-all focus:outline-none focus:ring',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            colorset === 'blue' && 'border-blue-700 bg-blue-600 text-white hover:bg-blue-800',
            colorset === 'red' && 'border-red-700 bg-red-600 text-white hover:bg-red-800',
            colorset === 'yellow' &&
              'border-yellow-500 bg-yellow-400 text-gray-800 hover:bg-yellow-600',
            colorset === 'green' && 'border-green-700 bg-green-600 text-white hover:bg-green-800',
          ]"
          :autofocus="autofocus === 'confirm'"
          @click="closeDelay(CONFIRMED_VALUE)"
        >
          {{ confirmText }}
        </button>
        <button
          v-if="cancelText"
          type="button"
          :class="[
            'inline-flex items-center justify-center shadow-sm transition-all focus:outline-none focus:ring',
            'min-w-[120px] rounded-md border px-4 py-2 text-sm font-medium',
            'border-gray-300 bg-white text-gray-800 hover:bg-gray-200',
          ]"
          :autofocus="autofocus === 'cancel'"
          @click="closeDelay()"
        >
          {{ cancelText }}
        </button>
      </footer>
    </form>
  </dialog>
</template>

<style scoped lang="postcss">
dialog {
  @apply translate-y-4 transform opacity-0 transition duration-200 ease-out sm:translate-y-0 sm:scale-95;
}

dialog.open {
  @apply translate-y-0 opacity-100 sm:scale-100;
}

dialog::backdrop,
dialog + .backdrop {
  @apply bg-gray-400/50 opacity-0 transition duration-150 ease-out;
}

dialog.open::backdrop,
dialog.open + .backdrop {
  @apply opacity-100;
}
</style>
