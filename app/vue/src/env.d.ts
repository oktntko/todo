/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // 第3引数に any を入れず、Props と RawBindings を空にすることで
  // 最低限のコンポーネントとしての整合性を保ちます
  // oxlint-disable-next-line typescript/no-explicit-any
  const component: DefineComponent<object, object, any>;
  export default component;
}
