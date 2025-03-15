<script setup lang="ts">
const CONFIRMED_VALUE = 'confirmed';

const {
  title = '',
  icon = '',
  colorset = 'blue',
  message = '',
  confirmText = '',
  cancelText = '',
  autofocus = 'cancel',
} = defineProps<{
  title?: string;
  icon?: string;
  colorset?: 'blue' | 'green' | 'yellow' | 'red';
  message: string;
  confirmText?: string;
  cancelText?: string;
  autofocus?: 'confirm' | 'cancel';
}>();

const emit = defineEmits<{
  close: [ok: boolean];
}>();

const refDialog = ref<HTMLDialogElement>();
const open = ref(false);

onMounted(() => {
  refDialog.value?.showModal();
  open.value = true;
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

    dialog.addEventListener('transitionend', (e) => {
      if (e.target === dialog) {
        dialog.close();
        emit('close', returnValue === CONFIRMED_VALUE);
      }
    });

    open.value = false;
  } else {
    emit('close', returnValue === CONFIRMED_VALUE);
  }
}
</script>

<template>
  <dialog
    ref="refDialog"
    :class="[
      'm-auto max-w-xl min-w-60 rounded-lg shadow-xl outline-hidden',
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
    <form method="dialog">
      <header
        v-if="title"
        class="flex items-start justify-between border-b border-gray-200 px-4 py-3"
      >
        <h3>{{ title }}</h3>
      </header>

      <main class="flex items-center gap-4 px-4 py-6">
        <div
          v-if="icon"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-8 sm:w-8"
          :class="{
            'bg-green-100 text-green-600' /*   */: colorset === 'green',
            'bg-yellow-100 text-yellow-600' /* */: colorset === 'yellow',
            'bg-red-100 text-red-600' /*       */: colorset === 'red',
            'bg-blue-100 text-blue-600' /*     */: colorset === 'blue',
          }"
        >
          <span :class="['h-6 w-6', icon]"></span>
        </div>

        <p class="text-sm whitespace-pre-wrap text-gray-500">
          {{ message }}
        </p>
      </main>

      <footer class="flex items-center justify-center gap-4 bg-gray-50 px-4 py-3">
        <button
          v-if="confirmText"
          type="button"
          :class="[
            'inline-flex cursor-pointer items-center justify-center shadow-xs transition-all focus:ring-3 focus:outline-hidden',
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
            'inline-flex cursor-pointer items-center justify-center shadow-sm transition-colors focus:ring focus:outline-hidden',
            'min-w-24 rounded-md border px-4 py-2 text-sm font-medium',
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
