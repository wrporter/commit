import type { Config } from 'tailwindcss';

export default {
    content: ['./app/**/*.{ts,tsx,jsx,js}', './node_modules/@wesp-up/ui/**/*.js'],
    theme: {
        container: {
            center: true,
            padding: '1rem',
        },
    },
} satisfies Config;
