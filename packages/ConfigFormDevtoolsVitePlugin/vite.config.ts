import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.ts'],
      thresholds: {
        branches: 90,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
  },
  build: {
    lib: {
      entry: {
        client: resolve(__dirname, 'src/client.ts'),
        index: resolve(__dirname, 'index.ts'),
      },
      fileName: (_, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        '@babel/parser',
        '@vue/compiler-sfc',
        'magic-string',
        'node:buffer',
        'node:child_process',
        'node:crypto',
        'node:fs',
        'node:path',
        'node:process',
        'node:url',
        'vite',
      ],
    },
  },
})
