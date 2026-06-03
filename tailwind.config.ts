import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#071014',
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} satisfies Config;
