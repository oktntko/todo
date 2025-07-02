// @ts-check

import cspellPlugin from '@cspell/eslint-plugin';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{.js,ts,mjs,mts,cjs,cts}'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    rules: {
      'no-undef': 'off', // When using TypeScript, we recommend to disable no-undef rule directly as TypeScript already check for them and you don't need to worry about this.
      '@typescript-eslint/ban-ts-ignore': 'off',
    },
  },
  {
    plugins: { '@cspell': cspellPlugin },
    rules: {
      '@cspell/spellchecker': ['warn', {}],
    },
  },
  { extends: [prettier] },
  { ignores: ['dist/*'] },
);
