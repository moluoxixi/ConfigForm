import Button from 'ant-design-vue/es/button'
import Divider from 'ant-design-vue/es/divider'
import Tabs from 'ant-design-vue/es/tabs'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css'

import './styles/config-form.scss'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
})

const app = createApp(App)
app.use(Button)
app.use(Divider)
app.use(i18n)
app.use(Tabs)
app.mount('#app')
