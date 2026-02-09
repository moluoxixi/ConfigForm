import { setReactiveAdapter } from '@moluoxixi/core'
import { mobxAdapter } from '@moluoxixi/reactive-react'
import { configure } from 'mobx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

/* MobX 配置 */
configure({ enforceActions: 'never' })

/* 初始化响应式适配器 */
setReactiveAdapter(mobxAdapter)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
