import type { App } from 'vue';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $window: Window & typeof globalThis;
    $document: Document;
  }
}

export default function (parentApp: App) {
  parentApp.config.globalProperties.$window = window;
  parentApp.config.globalProperties.$document = document;
}
