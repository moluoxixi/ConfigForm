import type { LowCodeDesignerComponentDefinition, LowCodeDesignerEditableProp } from '../../types'
import { DatePickerDefinition } from './DatePicker'
import { InputDefinition } from './Input'
import { InputNumberDefinition } from './InputNumber'
import { SelectDefinition } from './Select'
import { SwitchDefinition } from './Switch'
import { TextareaDefinition } from './Textarea'

/**
 * 内置组件的右侧属性面板定义。
 * 这些定义会在运行时与用户传入的自定义定义做深度合并。
 */
export const BUILTIN_RIGHT_COMPONENT_DEFINITIONS: Record<string, LowCodeDesignerComponentDefinition> = {
  Input: InputDefinition,
  Textarea: TextareaDefinition,
  Select: SelectDefinition,
  InputNumber: InputNumberDefinition,
  Switch: SwitchDefinition,
  DatePicker: DatePickerDefinition,
}

/**
 * 克隆单个可编辑属性定义，避免在合并过程中污染原始配置对象。
 * @param editableProp 当前要克隆的属性定义。
 * @returns 返回一份可安全修改的新对象。
 */
function cloneEditableProp(editableProp: LowCodeDesignerEditableProp): LowCodeDesignerEditableProp {
  return {
    ...editableProp,
    options: editableProp.options?.map(option => ({ ...option })),
  }
}

/**
 * 合并基础 editableProps 与覆盖 editableProps。
 * 合并规则：
 * 1. 以 key 作为唯一标识。
 * 2. 覆盖层存在同 key 时，覆盖基础层同名字段。
 * 3. options 显式传入时使用覆盖层，否则保留基础层 options。
 * @param base 内置组件提供的基础属性定义。
 * @param override 外部传入的覆盖属性定义。
 * @returns 返回最终属性定义列表；两侧都为空时返回 undefined。
 */
function mergeEditableProps(
  base: LowCodeDesignerEditableProp[] | undefined,
  override: LowCodeDesignerEditableProp[] | undefined,
): LowCodeDesignerEditableProp[] | undefined {
  if (!base && !override)
    return undefined

  const mergedMap = new Map<string, LowCodeDesignerEditableProp>()
  for (const editableProp of base ?? [])
    mergedMap.set(editableProp.key, cloneEditableProp(editableProp))

  for (const editableProp of override ?? []) {
    const prev = mergedMap.get(editableProp.key)
    if (!prev) {
      mergedMap.set(editableProp.key, cloneEditableProp(editableProp))
      continue
    }

    mergedMap.set(editableProp.key, {
      ...prev,
      ...editableProp,
      options: editableProp.options
        ? editableProp.options.map(option => ({ ...option }))
        : prev.options,
    })
  }

  return Array.from(mergedMap.values())
}

/**
 * 合并单个组件定义。
 * 默认 props 做浅层对象合并，editableProps 走 key 级别的结构化合并。
 * @param base 内置定义。
 * @param override 外部覆盖定义。
 * @returns 返回合并后的组件定义。
 */
function mergeDefinition(
  base: LowCodeDesignerComponentDefinition | undefined,
  override: LowCodeDesignerComponentDefinition | undefined,
): LowCodeDesignerComponentDefinition {
  return {
    ...base,
    ...override,
    defaultProps: {
      ...(base?.defaultProps ?? {}),
      ...(override?.defaultProps ?? {}),
    },
    editableProps: mergeEditableProps(base?.editableProps, override?.editableProps),
  }
}

/**
 * 合并内置组件定义与用户传入定义，并返回完整的“右侧属性面板定义表”。
 * @param customDefinitions 调用方传入的自定义定义表。
 * @returns 返回按组件名索引的最终定义表。
 */
export function mergeDesignerComponentDefinitions(
  customDefinitions: Record<string, LowCodeDesignerComponentDefinition> | undefined,
): Record<string, LowCodeDesignerComponentDefinition> {
  const allNames = new Set<string>([
    ...Object.keys(BUILTIN_RIGHT_COMPONENT_DEFINITIONS),
    ...Object.keys(customDefinitions ?? {}),
  ])

  const merged: Record<string, LowCodeDesignerComponentDefinition> = {}
  for (const name of allNames) {
    merged[name] = mergeDefinition(
      BUILTIN_RIGHT_COMPONENT_DEFINITIONS[name],
      customDefinitions?.[name],
    )
  }

  return merged
}
