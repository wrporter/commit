import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

const MODE = process.env.NODE_ENV;

export default defineConfig({
  optimizeDeps: { exclude: ["fsevents"] },
  build: {
    cssMinify: MODE === "production",

    rollupOptions: {
      external: [/node:.*/, "stream", "crypto", "fsevents"],
    },

    sourcemap: true,
  },
  plugins: [
    remix({
      serverModuleFormat: "esm",
    }),
  ],
});
