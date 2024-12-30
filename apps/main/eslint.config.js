import { default as defaultConfig } from "@epic-web/config/eslint";
import unusedImports from "eslint-plugin-unused-imports";

/** @type {import("eslint").Linter.Config} */
export default [
  ...defaultConfig,
  {
    ignores: [
      "node_modules",
      "/build",
      "/public/build",
      "/server-build",
      ".env",
      "/test-results/",
      "/coverage",
      "/migrations",
      "package-lock.json",
    ],
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
    },
  },
];
