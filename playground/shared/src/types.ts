import type { ISchema } from '@moluoxixi/schema'

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
}
