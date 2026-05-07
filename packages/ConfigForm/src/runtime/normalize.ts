import type { FormNodeConfig, NormalizedFieldConfig, NormalizedNodeConfig } from '@/types'
import { normalizeValidateOn } from '@/utils/field'

/** 所有节点共用的标准化：props 保证非空。 */
export function normalizeNode(node: FormNodeConfig): NormalizedNodeConfig {
  return { ...node, props: node.props ?? {} } as NormalizedNodeConfig
}

/** 有值绑定的节点补全绑定相关默认值（Field + Component 都需要）。 */
export function normalizeFieldBinding(
  node: NormalizedNodeConfig & { field: string },
): NormalizedFieldConfig {
  const trigger = (node as Partial<NormalizedFieldConfig>).trigger || 'update:modelValue'
  const blurTrigger = (node as Partial<NormalizedFieldConfig>).blurTrigger || 'blur'

  if (trigger === blurTrigger) {
    throw new Error(
      `Field "${node.field}" cannot use the same event for trigger and blurTrigger: ${trigger}`,
    )
  }

  return {
    ...node,
    blurTrigger,
    span: (node as Partial<NormalizedFieldConfig>).span ?? 24,
    trigger,
    validateOn: normalizeValidateOn((node as Partial<NormalizedFieldConfig>).validateOn),
    valueProp: (node as Partial<NormalizedFieldConfig>).valueProp || 'modelValue',
    submitWhenHidden: (node as Partial<NormalizedFieldConfig>).submitWhenHidden ?? false,
    submitWhenDisabled: (node as Partial<NormalizedFieldConfig>).submitWhenDisabled ?? true,
  }
}
