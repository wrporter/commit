import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const MODE = process.env.NODE_ENV;

export default defineConfig(({ isSsrBuild }) => ({
  server: { allowedHosts: ['wesplocal.com'] },
  optimizeDeps: { exclude: ['fsevents'] },
  build: {
    cssMinify: MODE === 'production',

    rollupOptions: {
      external: [/node:.*/, 'stream', 'crypto', 'fsevents'],
      // input: isSsrBuild ? "./server/main.ts" : undefined,
    },

    sourcemap: true,
  },

  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
}));
