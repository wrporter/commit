/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    css: { postcss: { plugins: [] } },
    test: {
        include: ['{app,server}/**/*.test.{ts,tsx}'],
        setupFiles: ['./tests/setup-test-env.ts'],
        restoreMocks: true,

        // TODO: Add reporters
        // TODO: Consider using happy-dom

        coverage: {
            include: ['{app,server}/**/*.{ts,tsx}'],
            exclude: ['*.{generated,config,test}.*'],
            all: true,

            // TODO: Add reporters
            // TODO: Add thresholds
        },
    },
})
