import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../ConfigForm/src'),
      '@moluoxixi/config-form': resolve(__dirname, 'test-shims/configFormCore.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'ConfigFormPluginI18n',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@moluoxixi/config-form'],
    },
  },
})
