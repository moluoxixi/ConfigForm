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

function cloneEditableProp(editableProp: LowCodeDesignerEditableProp): LowCodeDesignerEditableProp {
  return {
    ...editableProp,
    options: editableProp.options?.map(option => ({ ...option })),
  }
}

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
