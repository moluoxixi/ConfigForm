import type { FormInstance, FormPlugin, ISchema } from '@moluoxixi/core'

/**
 * Schema 变体切换配置
 *
 * 用于 LayoutForm 等需要动态切换 schema 的场景。
 * SceneRenderer 检测到此配置后渲染切换 UI。
 */
export interface SchemaVariants {
  /** 切换器标签 */
  label: string
  /** 变体选项 */
  options: Array<{ label: string, value: string }>
  /** 默认选中值 */
  defaultValue: string
  /** 根据选中值生成 Schema */
  factory: (value: string) => ISchema
}

export interface SceneI18nConfig {
  /** 多语言资源 */
  messages: Record<string, Record<string, string>>
  /** 默认语言 */
  defaultLocale?: string
}

/**
 * 场景配置
 *
 * Config / Field 模式都使用同一份 schema 渲染（通过 ConfigForm + SchemaField 递归）。
 */
export interface SceneConfig {
  /** 场景标题 */
  title: string
  /** 场景副标题/描述 */
  description: string
  /** 表单 Schema（Config 和 Field 模式共用） */
  schema: ISchema
  /** 初始值 */
  initialValues: Record<string, unknown>
  /** 可选：Schema 变体切换（如布局切换） */
  schemaVariants?: SchemaVariants
  /** 可选：i18n 配置（真实 i18n 库注入/示例使用） */
  i18n?: SceneI18nConfig
  /** 可选：语言切换选项 */
  localeOptions?: Array<{ label: string, value: string }>
  /** 可选：表单 effects（命令式监听，传递给 createForm） */
  effects?: (form: FormInstance) => void
  /** 可选：表单插件列表（传递给 createForm） */
  plugins?: FormPlugin[]
  /** 可选：字段配置（兼容旧场景/扩展场景） */
  fields?: Array<Record<string, unknown>>
}
