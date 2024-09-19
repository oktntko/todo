// @ts-check

import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import ts from 'typescript-eslint';

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
      'no-undef': 'off', // When using TypeScript, we recommend to disable no-undef rule directly as TypeScript already check for them and you don't need to worry about this.
      '@typescript-eslint/ban-ts-ignore': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'vue/prop-name-casing': ['warn', 'snake_case'],
    },
  },
);
