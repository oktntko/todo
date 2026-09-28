import { defineConfig } from 'oxfmt';

export default defineConfig({
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'all',
  sortImports: true,
  sortTailwindcss: {
    functions: ['clsx', 'cn', 'cva', 'tw'],
  },
  sortPackageJson: true,
  ignorePatterns: ['app/vue/drizzle/meta/', 'mockServiceWorker.js', 'vue-router.d.ts'],
});
