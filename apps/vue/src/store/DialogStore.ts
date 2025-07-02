export const useDialogStore = defineStore('dialog', () => {
  const dialogCount = ref(0);

  function increment() {
    dialogCount.value++;
  }
  function decrement() {
    dialogCount.value--;
  }

  // スクロール抑制
  watchEffect(() => {
    if (dialogCount.value >= 1) {
      document.body.style.overflowY = 'hidden';
      document.body.style.marginRight = '0.625rem'; // スクロールバー分ずれるので酔い防止
    } else {
      document.body.style.overflowY = 'scroll';
      document.body.style.marginRight = '0';
    }
  });

  return { dialogCount, increment, decrement };
});
