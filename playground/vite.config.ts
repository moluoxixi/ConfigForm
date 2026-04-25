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
        // 注入 core 包的 SCSS 变量，playground 中可覆盖 $namespace
        additionalData: `@import "${resolve(__dirname, '../packages/core/src/styles/variables').replace(/\\/g, '/')}";\n`,
      },
    },
  },
})
