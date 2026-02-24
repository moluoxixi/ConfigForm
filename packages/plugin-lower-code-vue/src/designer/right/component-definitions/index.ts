import type { LowCodeDesignerComponentDefinition, LowCodeDesignerEditableProp } from '../../types'
import { DatePickerDefinition } from './DatePicker'
import { InputDefinition } from './Input'
import { InputNumberDefinition } from './InputNumber'
import { SelectDefinition } from './Select'
import { SwitchDefinition } from './Switch'
import { TextareaDefinition } from './Textarea'

/**
 * mergeDesignerComponentDefinitions：执行当前位置的功能处理逻辑。
 * 定位：`packages/plugin-lower-code-vue/src/designer/right/component-definitions/index.ts:11`。
 * 功能：完成参数消化、业务分支处理及上下游结果传递。
 * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
 * @param customDefinitions 参数 customDefinitions 为当前逻辑所需的输入信息。
 * @returns 返回当前分支执行后的结果。
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
