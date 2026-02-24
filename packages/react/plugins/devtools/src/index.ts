/**
 * plugin-devtools-react 包入口。
 * 该入口负责暴露 React 版调试面板组件，并复用通用 devtools 类型定义。
 * 使用侧通过本入口接入调试能力，避免直接引用内部实现文件。
 */
export { DevToolsPanel } from './DevToolsPanel'
export type { DevToolsPanelProps } from '@moluoxixi/plugin-devtools'
