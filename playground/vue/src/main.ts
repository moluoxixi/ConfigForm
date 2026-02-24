import { setReactiveAdapter } from '@moluoxixi/core'
import { vueAdapter } from '@moluoxixi/reactive-vue'
import { ConfigForm } from '@moluoxixi/ui-basic-vue'
import { createApp } from 'vue'
import App from './App.vue'

/* 初始化响应式适配器 */
setReactiveAdapter(vueAdapter)

/**
 * app：定义该模块复用的常量配置。
 * 所属模块：`playground/vue/src/main.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const app = createApp(App)
app.component('ConfigForm', ConfigForm)
app.mount('#app')
