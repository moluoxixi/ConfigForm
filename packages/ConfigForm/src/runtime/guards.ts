import type { ComponentNodeConfig, DefinedFormNodeConfig, FieldConfig, FormNodeConfig } from '@/types'

/** 有值绑定 + 有标签 → 字段节点 */
export function isField(node: FormNodeConfig): node is FieldConfig {
  return hasFieldBinding(node) && 'label' in node && (node as FieldConfig).label != null
}

/** 有值绑定 + 无标签 → 组件节点 */
export function isComponent(node: FormNodeConfig): node is FieldConfig {
  return hasFieldBinding(node) && ((node as FieldConfig).label == null)
}

/** 无值绑定 → 容器节点 */
export function isContainer(node: FormNodeConfig): node is ComponentNodeConfig {
  return !hasFieldBinding(node)
}

/** 有值绑定（Field 或 Component） */
export function hasFieldBinding(node: FormNodeConfig | DefinedFormNodeConfig): node is FieldConfig {
  return typeof (node as FieldConfig).field === 'string'
}
