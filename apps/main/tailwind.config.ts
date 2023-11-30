import { nextui } from '@nextui-org/react';
import type { Config } from 'tailwindcss';

export default {
    content: [
        './app/**/*.{ts,tsx,jsx,js}',
        './node_modules/@wesp-up/ui/**/*.js',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    darkMode: 'class',
    plugins: [nextui()],
} satisfies Config;
