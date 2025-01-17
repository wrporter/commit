import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const MODE = process.env.NODE_ENV;

export default defineConfig(({ isSsrBuild }) => ({
  optimizeDeps: { exclude: ["fsevents"] },
  build: {
    cssMinify: MODE === "production",

    rollupOptions: {
      external: [/node:.*/, "stream", "crypto", "fsevents"],
      // input: isSsrBuild ? "./server/main.ts" : undefined,
    },

    sourcemap: true,
  },

  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },

  plugins: [reactRouter(), tsconfigPaths()],
}));
