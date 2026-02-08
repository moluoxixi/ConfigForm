import type { ISchema } from '@moluoxixi/schema'

/** 选项数据项 */
export interface OptionItem {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

/** Field 模式单个字段配置 */
export interface FieldConfig {
  /** 字段名（对应 form values 中的 key） */
  name: string
  /** 标签 */
  label: string
  /** 是否必填 */
  required?: boolean
  /** 组件名 */
  component: string
  /** 组件 props */
  componentProps?: Record<string, unknown>
  /** 选项数据（Select/RadioGroup/CheckboxGroup 等） */
  dataSource?: OptionItem[]
  /** 校验规则 */
  rules?: unknown[]
  /** 描述 */
  description?: string
}

/** 场景配置 */
export interface SceneConfig {
  /** 场景标题 */
  title: string
  /** 场景副标题/描述 */
  description: string
  /** Config 模式 Schema */
  schema: ISchema
  /** 初始值 */
  initialValues: Record<string, unknown>
  /** Field 模式字段列表（有序数组，用于动态渲染 FormField） */
  fields: FieldConfig[]
}
