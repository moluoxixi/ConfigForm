import Button from 'ant-design-vue/es/button'
import Divider from 'ant-design-vue/es/divider'
import Tabs from 'ant-design-vue/es/tabs'
import { createApp } from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css'

import './styles/config-form.scss'

const app = createApp(App)
app.use(Button)
app.use(Divider)
app.use(Tabs)
app.mount('#app')
