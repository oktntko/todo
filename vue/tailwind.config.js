// @ts-check

import { addDynamicIconSelectors } from '@iconify/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      width: {
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        mono: ['"M PLUS 1 Code"', 'monospace'],
      },
    },
  },
  plugins: [addDynamicIconSelectors()],
};
