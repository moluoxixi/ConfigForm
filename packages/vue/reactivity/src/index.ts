/**
 * reactive-vue 包入口。
 * 该入口只暴露 Vue 响应式适配器实现，供 core 层注册后驱动表单响应逻辑。
 * 保持单一导出有助于减少适配层误用与版本耦合。
 */
export { vueAdapter } from './adapter'
