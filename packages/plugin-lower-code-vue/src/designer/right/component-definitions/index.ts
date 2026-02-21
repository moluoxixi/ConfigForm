import type { LowCodeDesignerComponentDefinition, LowCodeDesignerEditableProp } from '../../types'
import { DatePickerDefinition } from './DatePicker'
import { InputDefinition } from './Input'
import { InputNumberDefinition } from './InputNumber'
import { SelectDefinition } from './Select'
import { SwitchDefinition } from './Switch'
import { TextareaDefinition } from './Textarea'

export const BUILTIN_RIGHT_COMPONENT_DEFINITIONS: Record<string, LowCodeDesignerComponentDefinition> = {
  Input: InputDefinition,
  Textarea: TextareaDefinition,
  Select: SelectDefinition,
  InputNumber: InputNumberDefinition,
  Switch: SwitchDefinition,
  DatePicker: DatePickerDefinition,
}

/**
 * clone Editable Prop：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Editable Prop 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function cloneEditableProp(editableProp: LowCodeDesignerEditableProp): LowCodeDesignerEditableProp {
  return {
    ...editableProp,
    options: editableProp.options?.map(option => ({ ...option })),
  }
}

/**
 * merge Editable Props：负责“合并merge Editable Props”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 merge Editable Props 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
 * merge Definition：负责“合并merge Definition”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 merge Definition 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
 * merge Designer Component Definitions：负责“合并merge Designer Component Definitions”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 merge Designer Component Definitions 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
