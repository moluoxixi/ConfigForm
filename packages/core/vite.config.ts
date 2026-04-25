import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [Vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // @import is deprecated in Sass 3.0 but currently the only
        // reliable way to inject variables into Vue SFC style blocks.
        // Will migrate to @use once Vite/Sass resolves the scoping issue.
        additionalData: `@import "${resolve(__dirname, 'src/styles/variables').replace(/\\/g, '/')}";\n`,
      },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ConfigFormCore',
      fileName: 'config-form-core',
    },
    rollupOptions: {
      external: ['vue', 'zod'],
      output: {
        globals: {
          vue: 'Vue',
          zod: 'Zod',
        },
      },
    },
  },
})
