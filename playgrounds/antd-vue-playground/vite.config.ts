import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { configFormDevtools } from '@moluoxixi/config-form-devtools-vite-plugin'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [configFormDevtools(), Vue(), VueJsx()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
