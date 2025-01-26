import config from "@wesp-up/eslint-config-react";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      ".react-router",
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
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
    },
    rules: {
      "import-x/no-extraneous-dependencies": [
        "error",
        { devDependencies: ["**/*.{test,config,build,fake,mock,seed}.*"] },
      ],
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/unbound-method": "off",
    },
    ignores: [".react-router/**/*"],
  },
  {
    files: ["**/*.{test,fake,mock,seed}.*", "**/*.{js,cjs,mjs,jsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },
];
