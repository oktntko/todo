// @ts-check

// import pluginVitest from '@vitest/eslint-plugin';
import cspellPlugin from '@cspell/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
// import pluginPlaywright from 'eslint-plugin-playwright';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/prop-name-casing': 'off',
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: ['ts', 'tsx'],
          },
        },
      ],
      'vue/one-component-per-file': 'off',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
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
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: { '@cspell': cspellPlugin },
    rules: {
      '@cspell/spellchecker': ['warn', {}],
    },
  },

  // {
  //   ...pluginVitest.configs.recommended,
  //   files: ['src/**/__tests__/*'],
  // },

  // {
  //   ...pluginPlaywright.configs['flat/recommended'],
  //   files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  // },
  skipFormatting,
);
