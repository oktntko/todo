// @ts-check

import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default ts.config(
  {
    files: ['**/*.{.vue,js,ts,mjs,mts,cjs,cts,jsx,tsx}'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...vue.configs['flat/recommended'],
  prettier,
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/ban-ts-ignore': 'off',
    },
  },
);
