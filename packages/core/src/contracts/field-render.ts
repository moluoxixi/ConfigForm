import type { DataSourceItem, FieldPattern } from '../shared'
import type { FieldInstance, FormInstance } from '../types'
import type { ValidationFeedback } from '../validator'

/**
 * 跨框架字段渲染状态（UI 无关语义）
 *
 * 说明：
 * - 该契约只表达“字段该如何被渲染”的语义，不包含 React/Vue 的事件名细节。
 * - 框架层负责把这份语义映射为 `onChange` / `onUpdate:modelValue` 等具体写法。
 */
export interface FieldRenderContract {
  disabled: boolean
  preview: boolean
  loading: boolean
  value: unknown
  dataSource: DataSourceItem[]
  componentProps: Record<string, unknown>
  ariaProps: Record<string, unknown>
}

/** 跨框架字段交互契约（UI 无关语义） */
export interface FieldInteractionContract {
  onInput: (value: unknown) => void
  onFocus: () => void
  onBlur: () => void
}

/** 装饰器渲染契约（UI 无关语义） */
export interface DecoratorRenderContract {
  fieldPath: string
  hasErrors: boolean
  label: string
  required: boolean
  errors: ValidationFeedback[]
  warnings: ValidationFeedback[]
  description: string
  pattern: FieldPattern
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: number | string
  decoratorProps: Record<string, unknown>
}

/**
 * 构建字段渲染契约
 *
 * 将 FieldInstance 映射为框架无关的渲染语义。
 */
export function createFieldRenderContract(field: FieldInstance): FieldRenderContract {
  const ariaProps: Record<string, unknown> = {}
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
 * 构建字段交互契约
 *
 * 统一输入/聚焦/失焦行为，避免 React/Vue 分叉。
 */
export function createFieldInteractionContract(field: FieldInstance): FieldInteractionContract {
  return {
    onInput: (value: unknown) => field.onInput(value as never),
    onFocus: () => field.focus(),
    onBlur: () => field.blur(),
  }
}

/** 构建装饰器渲染契约 */
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
