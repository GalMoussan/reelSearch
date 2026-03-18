import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    globals: false,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['tests/setup.ts'],
    environment: 'node',
    environmentMatchGlobs: [['tests/**/*.tsx', 'jsdom']],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
