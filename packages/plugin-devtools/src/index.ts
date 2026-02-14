/**
 * @moluoxixi/plugin-devtools
 *
 * 框架无关的 DevTools 核心插件（数据采集 + API + 全局 Hook）。
 * 面板组件请使用：
 * - React: @moluoxixi/plugin-devtools-react
 * - Vue: @moluoxixi/plugin-devtools-vue
 */
export { devToolsPlugin } from './plugin'
export type { DevToolsPluginConfig } from './plugin'
export type {
  DevToolsGlobalHook,
  DevToolsPluginAPI,
  EventLogEntry,
  FieldDetail,
  FieldTreeNode,
  FormOverview,
  ValueDiffEntry,
} from './types'
