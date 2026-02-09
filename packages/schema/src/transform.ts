import type { ArrayFieldProps, FieldProps, VoidFieldProps } from '@moluoxixi/core'
import type { CompiledField, CompiledSchema } from './types'
import { evaluateExpression, isExpression, isFunction } from '@moluoxixi/core'

/**
 * 将编译后的字段转为 FieldProps
 */
export function toFieldProps(compiled: CompiledField): FieldProps {
  const { schema, dataPath } = compiled

  const props: FieldProps = {
    name: dataPath,
    label: schema.title,
    description: schema.description,
    initialValue: schema.default,
    visible: schema.visible,
    disabled: schema.disabled,
    readOnly: schema.readOnly,
    required: schema.required === true,
    rules: schema.rules ?? [],
    component: compiled.resolvedComponent,
    componentProps: {
      ...schema.componentProps,
    },
    decorator: compiled.resolvedDecorator,
    decoratorProps: schema.decoratorProps,
    reactions: schema.reactions,
    pattern: schema.pattern,
    submitPath: schema.submitPath,
    excludeWhenHidden: schema.excludeWhenHidden,
  }

  /* 处理数据源 */
  if (schema.dataSource) {
    props.dataSource = schema.dataSource
  }

  /*
   * 处理数据转换函数。
   *
   * 支持两种写法：
   * - 函数：直接透传
   * - {{表达式}}：编译为函数，表达式中 $deps[0] 为传入值
   */
  if (schema.displayFormat) {
    if (isFunction(schema.displayFormat)) {
      props.displayFormat = schema.displayFormat as (value: unknown) => unknown
    }
    else if (isExpression(schema.displayFormat)) {
      const expr = schema.displayFormat
      props.displayFormat = ((value: unknown) =>
        evaluateExpression(expr, { $deps: [value] })) as (value: unknown) => unknown
    }
  }
  if (schema.inputParse) {
    if (isFunction(schema.inputParse)) {
      props.inputParse = schema.inputParse as (value: unknown) => unknown
    }
    else if (isExpression(schema.inputParse)) {
      const expr = schema.inputParse
      props.inputParse = ((value: unknown) =>
        evaluateExpression(expr, { $deps: [value] })) as (value: unknown) => unknown
    }
  }
  if (schema.submitTransform) {
    if (isFunction(schema.submitTransform)) {
      props.submitTransform = schema.submitTransform as (value: unknown) => unknown
    }
    else if (isExpression(schema.submitTransform)) {
      const expr = schema.submitTransform
      props.submitTransform = ((value: unknown) =>
        evaluateExpression(expr, { $deps: [value] })) as (value: unknown) => unknown
    }
  }

  /*
   * 必填规则由 Field 构造器统一处理（根据 props.required 添加），
   * 此处不再重复添加，避免 Schema → toFieldProps → Field 构造器链路中规则重复。
   */

  return props
}

/**
 * 将编译后的字段转为 ArrayFieldProps
 */
export function toArrayFieldProps(compiled: CompiledField): ArrayFieldProps {
  const base = toFieldProps(compiled)
  const { schema } = compiled

  return {
    ...base,
    minItems: schema.minItems,
    maxItems: schema.maxItems,
    itemTemplate: schema.itemTemplate,
    initialValue: base.initialValue ?? [],
  } as ArrayFieldProps
}

/**
 * 将编译后的字段转为 VoidFieldProps
 */
export function toVoidFieldProps(compiled: CompiledField): VoidFieldProps {
  const { schema, address } = compiled

  return {
    name: address,
    label: schema.title,
    visible: schema.visible,
    disabled: schema.disabled,
    readOnly: schema.readOnly,
    component: compiled.resolvedComponent,
    componentProps: schema.componentProps,
    reactions: schema.reactions,
    pattern: schema.pattern,
  }
}

/**
 * 从 CompiledSchema 生成所有字段的 Props
 */
export function transformSchema(
  compiledSchema: CompiledSchema,
): {
  fields: Array<{ path: string, props: FieldProps, type: 'field' | 'array' | 'void' }>
} {
  const fields: Array<{ path: string, props: FieldProps, type: 'field' | 'array' | 'void' }> = []

  for (const [address, compiled] of compiledSchema.fields) {
    if (address.includes('.*'))
      continue

    if (compiled.isVoid) {
      fields.push({ path: address, props: toVoidFieldProps(compiled) as unknown as FieldProps, type: 'void' })
    }
    else if (compiled.isArray) {
      fields.push({ path: address, props: toArrayFieldProps(compiled) as unknown as FieldProps, type: 'array' })
    }
    else {
      fields.push({ path: address, props: toFieldProps(compiled), type: 'field' })
    }
  }

  return { fields }
}
