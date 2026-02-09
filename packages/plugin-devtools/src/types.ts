/**
 * DevTools 数据类型
 *
 * 所有类型均为纯序列化数据（无 class 实例、无函数引用），
 * 可直接通过 JSON.stringify 传输。
 * 浮动面板和 Chrome Extension 共用同一套类型。
 */

/** 字段树节点 */
export interface FieldTreeNode {
  /** 字段路径 */
  path: string
  /** 字段名 */
  name: string
  /** 字段类型 */
  type: 'field' | 'arrayField' | 'objectField' | 'voidField'
  /** 标签 */
  label: string
  /** 组件名 */
  component: string
  /** 有效 pattern */
  pattern: string
  /** 是否可见 */
  visible: boolean
  /** 是否禁用 */
  disabled: boolean
  /** 是否预览 */
  preview: boolean
  /** 是否必填 */
  required: boolean
  /** 是否已挂载 */
  mounted: boolean
  /** 当前值（JSON 安全） */
  value: unknown
  /** 错误数量 */
  errorCount: number
  /** 警告数量 */
  warningCount: number
  /** 子节点 */
  children: FieldTreeNode[]
}

/** 字段详情（选中某个字段时展示） */
export interface FieldDetail {
  path: string
  name: string
  label: string
  type: 'field' | 'arrayField' | 'objectField' | 'voidField'
  /** 组件 */
  component: string
  decorator: string
  /** 状态 */
  pattern: string
  selfPattern: string
  visible: boolean
  disabled: boolean
  preview: boolean
  mounted: boolean
  /** 数据 */
  value: unknown
  initialValue: unknown
  /** 验证 */
  required: boolean
  errors: Array<{ path: string, message: string }>
  warnings: Array<{ path: string, message: string }>
  /** 数据源 */
  dataSource: Array<{ label: string, value: unknown }>
  dataSourceLoading: boolean
  /** 组件 Props */
  componentProps: Record<string, unknown>
  decoratorProps: Record<string, unknown>
}

/** 事件日志条目 */
export interface EventLogEntry {
  /** 自增 ID */
  id: number
  /** 事件类型 */
  type: string
  /** 事件时间戳 */
  timestamp: number
  /** 相关字段路径（字段事件时） */
  fieldPath?: string
  /** 事件数据摘要 */
  summary: string
}

/** 表单概览 */
export interface FormOverview {
  /** 表单 pattern */
  pattern: string
  /** 字段总数 */
  fieldCount: number
  /** 错误字段数 */
  errorFieldCount: number
  /** 当前值 */
  values: Record<string, unknown>
  /** 初始值 */
  initialValues: Record<string, unknown>
  /** 是否提交中 */
  submitting: boolean
  /** 是否验证中 */
  validating: boolean
}

/** 值 diff 条目 */
export interface ValueDiffEntry {
  path: string
  label: string
  currentValue: unknown
  initialValue: unknown
  changed: boolean
}

/** DevTools 插件暴露的 API（浮动面板和 Extension 共用） */
export interface DevToolsPluginAPI {
  /* ---- 只读查询 ---- */

  /** 获取字段树 */
  getFieldTree: () => FieldTreeNode[]
  /** 获取字段详情 */
  getFieldDetail: (path: string) => FieldDetail | null
  /** 获取表单概览 */
  getFormOverview: () => FormOverview
  /** 获取事件日志 */
  getEventLog: () => EventLogEntry[]
  /** 获取值 diff（当前值 vs 初始值） */
  getValueDiff: () => ValueDiffEntry[]
  /** 注册数据变化监听 */
  subscribe: (listener: () => void) => () => void

  /* ---- 调试操作 ---- */

  /** 清空事件日志 */
  clearEventLog: () => void
  /** 高亮字段（页面 DOM 闪烁） */
  highlightField: (path: string) => void
  /** 修改字段值 */
  setFieldValue: (path: string, value: unknown) => void
  /** 修改字段状态 */
  setFieldState: (path: string, state: Partial<{ visible: boolean, disabled: boolean, preview: boolean, pattern: string }>) => void
  /** 触发全表单验证，返回错误列表 */
  validateAll: () => Promise<Array<{ path: string, message: string }>>
  /** 重置表单 */
  resetForm: () => void
  /** 提交表单 */
  submitForm: () => Promise<{ success: boolean, errors: Array<{ path: string, message: string }> }>
}

/** DevTools 全局 Hook（为 Chrome Extension 预留） */
export interface DevToolsGlobalHook {
  /** 已注册的表单实例 */
  forms: Map<string, DevToolsPluginAPI>
  /** 注册表单 */
  register: (formId: string, api: DevToolsPluginAPI) => void
  /** 注销表单 */
  unregister: (formId: string) => void
  /** 订阅表单注册/注销事件（事件驱动，无需轮询） */
  onChange: (listener: (forms: Map<string, DevToolsPluginAPI>) => void) => () => void
}
