import type { LowCodeDesignerDecoratorDefinition, LowCodeDesignerEditableProp } from '../../types'
import { FormItemDefinition } from './FormItem'

export const BUILTIN_RIGHT_DECORATOR_DEFINITIONS: Record<string, LowCodeDesignerDecoratorDefinition> = {
  FormItem: FormItemDefinition,
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
  base: LowCodeDesignerDecoratorDefinition | undefined,
  override: LowCodeDesignerDecoratorDefinition | undefined,
): LowCodeDesignerDecoratorDefinition {
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

export function mergeDesignerDecoratorDefinitions(
  customDefinitions: Record<string, LowCodeDesignerDecoratorDefinition> | undefined,
): Record<string, LowCodeDesignerDecoratorDefinition> {
  const allNames = new Set<string>([
    ...Object.keys(BUILTIN_RIGHT_DECORATOR_DEFINITIONS),
    ...Object.keys(customDefinitions ?? {}),
  ])

  const merged: Record<string, LowCodeDesignerDecoratorDefinition> = {}
  for (const name of allNames) {
    merged[name] = mergeDefinition(
      BUILTIN_RIGHT_DECORATOR_DEFINITIONS[name],
      customDefinitions?.[name],
    )
  }

  return merged
}
