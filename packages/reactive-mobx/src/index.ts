export { mobxAdapter } from './adapter'

/**
 * Re-export observer from mobx-react-lite
 *
 * UI 组件和布局组件统一从 @moluoxixi/reactive-mobx 导入 observer，
 * 而不是直接依赖 mobx-react-lite。这样其他响应式适配器（如 Solid）
 * 可以提供自己的 observer 实现。
 */
export { observer } from 'mobx-react-lite'

