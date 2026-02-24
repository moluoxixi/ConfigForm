/**
 * plugin-devtools-vue 包入口。
 * 本文件聚合 Vue 版调试面板导出，并转发跨框架共享的面板属性类型。
 * 外部集成请始终通过该入口导入，保证后续内部重构不影响调用方路径。
 */
export { DevToolsPanel } from './DevToolsPanel'
export type { DevToolsPanelProps } from '@moluoxixi/plugin-devtools'
