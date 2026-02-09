export { mobxAdapter } from './adapter'

/**
 * Re-export observer from mobx-react-lite
 *
 * observer 是 MobX 响应式体系中 React 组件的桥接层，
 * 让 React 组件能自动响应 MobX observable 的变化。
 *
 * 所有 React 组件和 UI 适配层统一从 @moluoxixi/reactive-react 导入 observer。
 */
export { observer } from 'mobx-react-lite'
