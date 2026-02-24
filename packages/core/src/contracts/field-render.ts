import type { DataSourceItem, FieldPattern } from '../shared'
import type { FieldInstance, FormInstance } from '../types'
import type { ValidationFeedback } from '../validator'

/**
 * 跨框架字段渲染契约。
 * 该结构只描述“字段当前应如何展示”，不包含框架特有事件名。
 * React/Vue 适配层会把这份语义映射为各自组件需要的 props。
 */
export interface FieldRenderContract {
  /** 是否禁用交互。 */
  disabled: boolean
  /** 是否处于只读预览模式。 */
  preview: boolean
  /** 是否处于异步加载态。 */
  loading: boolean
  /** 当前字段值。 */
  value: unknown
  /** 选项类组件的数据源。 */
  dataSource: DataSourceItem[]
  /** 透传给字段组件的属性。 */
  componentProps: Record<string, unknown>
  /** ARIA 可访问性属性。 */
  ariaProps: Record<string, unknown>
}

/**
 * 跨框架字段交互契约。
 * 适配层只需调用这三个动作即可驱动字段状态机。
 */
export interface FieldInteractionContract {
  /** 处理输入值变化。 */
  onInput: (value: unknown) => void
  /** 处理聚焦事件。 */
  onFocus: () => void
  /** 处理失焦事件。 */
  onBlur: () => void
}

/**
 * 装饰器渲染契约。
 * 用于描述标签、提示、错误信息等“字段外壳”渲染信息。
 */
export interface DecoratorRenderContract {
  /** 字段路径，通常用于 key 与定位。 */
  fieldPath: string
  /** 当前是否存在错误。 */
  hasErrors: boolean
  /** 字段标题。 */
  label: string
  /** 字段是否必填。 */
  required: boolean
  /** 错误反馈列表。 */
  errors: ValidationFeedback[]
  /** 警告反馈列表。 */
  warnings: ValidationFeedback[]
  /** 字段说明文案。 */
  description: string
  /** 字段展示模式（editable / readPretty 等）。 */
  pattern: FieldPattern
  /** 来自表单布局的标签位置。 */
  labelPosition?: 'top' | 'left' | 'right'
  /** 来自表单布局的标签宽度。 */
  labelWidth?: number | string
  /** 透传给装饰器组件的属性。 */
  decoratorProps: Record<string, unknown>
}

/**
 * 从字段实例构建“渲染层可直接消费”的统一契约。
 * @param field 字段实例。
 * @returns 字段渲染契约。
 */
export function createFieldRenderContract(field: FieldInstance): FieldRenderContract {
  const ariaProps: Record<string, unknown> = {}
  // 仅在字段声明了相关 ARIA 信息时才注入，避免向组件透传冗余属性。
  if (field.ariaLabel)
    ariaProps['aria-label'] = field.ariaLabel
  if (field.ariaDescribedBy)
    ariaProps['aria-describedby'] = field.ariaDescribedBy
  if (field.ariaLabelledBy)
    ariaProps['aria-labelledby'] = field.ariaLabelledBy
  if (field.ariaInvalid)
    ariaProps['aria-invalid'] = true
  if (field.ariaRequired)
    ariaProps['aria-required'] = true

  return {
    disabled: field.effectiveDisabled,
    preview: field.isPreview,
    loading: field.loading,
    value: field.value,
    dataSource: field.dataSource,
    componentProps: field.componentProps,
    ariaProps,
  }
}

/**
 * 从字段实例构建统一交互契约。
 * @param field 字段实例。
 * @returns 字段交互契约。
 */
export function createFieldInteractionContract(field: FieldInstance): FieldInteractionContract {
  return {
    // 输入值统一走 onInput，保证字段内部联动链路一致。
    onInput: (value: unknown) => field.onInput(value as never),
    // 聚焦行为由字段实例接管，适配层无需关心具体实现。
    onFocus: () => field.focus(),
    // 失焦同理，统一透传到字段状态机。
    onBlur: () => field.blur(),
  }
}

/**
 * 从字段与表单布局信息构建装饰器契约。
 * @param field 字段实例。
 * @param form 可选的表单布局上下文，仅用于读取全局标签配置。
 * @returns 装饰器渲染契约。
 */
export function createDecoratorRenderContract(
  field: FieldInstance,
  form?: Pick<FormInstance, 'labelPosition' | 'labelWidth'> | null,
): DecoratorRenderContract {
  const hasErrors = field.errors.length > 0

  return {
    fieldPath: field.path,
    hasErrors,
    label: field.label,
    required: field.required,
    errors: field.errors,
    warnings: field.warnings,
    description: field.description,
    pattern: field.pattern,
    labelPosition: form?.labelPosition,
    labelWidth: form?.labelWidth,
    decoratorProps: field.decoratorProps,
  }
}
