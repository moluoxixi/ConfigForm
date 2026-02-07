import type { ArrayFieldProps, FieldProps, VoidFieldProps } from '@moluoxixi/core'
import type { CompiledField, CompiledSchema } from './types'
import { isFunction } from '@moluoxixi/shared'

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
    wrapper: compiled.resolvedDecorator,
    wrapperProps: schema.decoratorProps,
    reactions: schema.reactions,
    pattern: schema.pattern,
    submitPath: schema.submitPath,
    excludeWhenHidden: schema.excludeWhenHidden,
  }

  /* 处理数据源 */
  if (schema.dataSource) {
    props.dataSource = schema.dataSource
  }

  /* 处理数据转换函数 */
  if (schema.format && isFunction(schema.format)) {
    props.format = schema.format as (value: unknown) => unknown
  }
  if (schema.parse && isFunction(schema.parse)) {
    props.parse = schema.parse as (value: unknown) => unknown
  }
  if (schema.transform && isFunction(schema.transform)) {
    props.transform = schema.transform as (value: unknown) => unknown
  }

  /* 必填规则 */
  if (schema.required === true && !props.rules!.some(r => r.required)) {
    props.rules!.unshift({ required: true })
  }

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
  fields: Array<{ path: string; props: FieldProps; type: 'field' | 'array' | 'void' }>
} {
  const fields: Array<{ path: string; props: FieldProps; type: 'field' | 'array' | 'void' }> = []

  for (const [address, compiled] of compiledSchema.fields) {
    if (address.includes('.*'))
      continue

    if (compiled.isVoid) {
      fields.push({ path: address, props: toVoidFieldProps(compiled) as unknown as FieldProps, type: 'void' })
    }
    else if (compiled.isArray) {
      fields.push({ path: address, props: toArrayFieldProps(compiled), type: 'array' })
    }
    else {
      fields.push({ path: address, props: toFieldProps(compiled), type: 'field' })
    }
  }

  return { fields }
}
