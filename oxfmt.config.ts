import { defineConfig } from 'oxfmt';

export default defineConfig({
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'all',
  experimentalSortImports: {
    groups: [
      'type-import',
      ['value-builtin', 'value-external'],
      'type-internal',
      'value-internal',
      ['type-parent', 'type-sibling', 'type-index'],
      ['value-parent', 'value-sibling', 'value-index'],
      'unknown',
    ],
  },
  experimentalTailwindcss: {},
  experimentalSortPackageJson: true,
  ignorePatterns: ['app/vue/drizzle/meta/', 'mockServiceWorker.js', 'vue-router.d.ts'],
  // sortTailwindcss: {
  //   stylesheet: "app/hono-react/src/client/main.css",
  //   functions: ["clsx", "cn"],
  // },
});
