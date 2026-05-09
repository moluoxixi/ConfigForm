import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import 'element-plus/dist/index.css'

import './styles/config-form.scss'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
