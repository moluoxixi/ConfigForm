import { setReactiveAdapter } from '@moluoxixi/core'
import { vueAdapter } from '@moluoxixi/reactive-vue'
import { createApp } from 'vue'
import App from './App.vue'

/* 初始化响应式适配器 */
setReactiveAdapter(vueAdapter)

const app = createApp(App)
app.mount('#app')
