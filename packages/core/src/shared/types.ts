/** 路径片段类型 */
export type PathSegment = string | number

/** 通用释放器 */
export type Disposer = () => void

/** 通用函数类型 */
export type AnyFunction = (...args: any[]) => any

/** 数据源项 */
export interface DataSourceItem {
  label: string
  value: string | number | boolean
  disabled?: boolean
  children?: DataSourceItem[]
  [key: string]: unknown
}

/** 反馈信息 */
export interface Feedback {
  path: string
  message: string
  type: 'error' | 'warning' | 'success'
  code?: string
}

/** 字段模式 */
export type FieldPattern = 'editable' | 'preview' | 'disabled'

/**
 * 字段展示状态（参考 Formily display 三态）
 *
 * - `visible`：正常显示（默认）
 * - `hidden`：隐藏 UI 但**保留数据**（提交时仍包含该字段值）
 * - `none`：隐藏 UI 且**排除数据**（提交时不包含该字段值）
 */
export type FieldDisplay = 'visible' | 'hidden' | 'none'

/** 验证触发时机 */
export type ValidateTrigger = 'change' | 'blur' | 'submit'

/** 字段状态更新 */
export interface FieldStateUpdate {
  visible?: boolean
  display?: FieldDisplay
  disabled?: boolean
  preview?: boolean
  loading?: boolean
  value?: unknown
  component?: string
  componentProps?: Record<string, unknown>
  dataSource?: DataSourceItem[]
  required?: boolean
  pattern?: FieldPattern
}

/** 深层键路径推断（最多 4 层） */
export type DeepKeyOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: Prefix extends ''
        ? K | DeepKeyOf<T[K], K>
        : `${Prefix}.${K}` | DeepKeyOf<T[K], `${Prefix}.${K}`>;
    }[keyof T & string]
  : never

/** 可为空类型 */
export type Nullable<T> = T | null | undefined

/** 组件类型占位（框架桥接层具体化） */
export type ComponentType = string | ((...args: any[]) => any) | object
