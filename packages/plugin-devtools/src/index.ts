/**
 * @moluoxixi/plugin-devtools
 *
 * 框架无关的 DevTools 核心插件（数据采集 + API + 全局 Hook）。
 * 面板组件请使用：
 * - React: @moluoxixi/plugin-devtools-react
 * - Vue: @moluoxixi/plugin-devtools-vue
 */
export { devToolsPlugin } from './plugin'
export {
  buildDevToolsFieldEventSummary,
  DEVTOOLS_ACTION_EVENT_LABELS,
  DEVTOOLS_FIELD_EVENT_DEFINITIONS,
  DEVTOOLS_FORM_EVENT_DEFINITIONS,
} from './events'
export type { DevToolsPluginConfig } from './plugin'
export type {
  DevToolsFieldEventDefinition,
  DevToolsFormEventDefinition,
} from './events'
export type {
  DevToolsActionEventType,
  DevToolsEventType,
  DevToolsGlobalHook,
  DevToolsPanelProps,
  DevToolsPluginAPI,
  EventLogEntry,
  FieldDetail,
  FieldTreeNode,
  FormOverview,
  ValueDiffEntry,
} from './types'
