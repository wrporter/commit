import { heroui } from '@heroui/theme';
import { type Config } from 'tailwindcss';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx,jsx,js}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [heroui()],
} satisfies Config;
