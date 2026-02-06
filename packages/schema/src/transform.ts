import { isFunction } from '@moluoxixi/shared';
import type { FieldProps, ArrayFieldProps, VoidFieldProps } from '@moluoxixi/core';
import type { CompiledField, CompiledSchema } from './types';

/**
 * 将编译后的字段转为 FieldProps
 */
export function toFieldProps(compiled: CompiledField): FieldProps {
  const { schema, path } = compiled;

  const props: FieldProps = {
    name: path.includes('.') ? path.split('.').pop()! : path,
    label: schema.label,
    description: schema.description,
    initialValue: schema.defaultValue,
    visible: schema.visible,
    disabled: schema.disabled,
    readOnly: schema.readOnly,
    required: schema.required,
    rules: schema.rules ?? [],
    component: compiled.resolvedComponent,
    componentProps: {
      ...schema.componentProps,
      placeholder: schema.placeholder,
    },
    wrapper: schema.wrapper,
    wrapperProps: schema.wrapperProps,
    reactions: schema.reactions,
    pattern: schema.pattern,
    submitPath: schema.submitPath,
    excludeWhenHidden: schema.excludeWhenHidden,
  };

  /* 处理数据源 */
  if (schema.dataSource) {
    props.dataSource = schema.dataSource;
  }

  /* 处理数据转换函数 */
  if (schema.format && isFunction(schema.format)) {
    props.format = schema.format as (value: unknown) => unknown;
  }
  if (schema.parse && isFunction(schema.parse)) {
    props.parse = schema.parse as (value: unknown) => unknown;
  }
  if (schema.transform && isFunction(schema.transform)) {
    props.transform = schema.transform as (value: unknown) => unknown;
  }

  /* 必填规则 */
  if (schema.required && !props.rules!.some((r) => r.required)) {
    props.rules!.unshift({ required: true });
  }

  return props;
}

/**
 * 将编译后的字段转为 ArrayFieldProps
 */
export function toArrayFieldProps(compiled: CompiledField): ArrayFieldProps {
  const base = toFieldProps(compiled);
  const { schema } = compiled;

  return {
    ...base,
    minItems: schema.minItems,
    maxItems: schema.maxItems,
    itemTemplate: schema.itemTemplate,
    initialValue: base.initialValue ?? [],
  } as ArrayFieldProps;
}

/**
 * 将编译后的字段转为 VoidFieldProps
 */
export function toVoidFieldProps(compiled: CompiledField): VoidFieldProps {
  const { schema, path } = compiled;

  return {
    name: path.includes('.') ? path.split('.').pop()! : path,
    label: schema.label,
    visible: schema.visible,
    component: compiled.resolvedComponent,
    componentProps: schema.componentProps,
    reactions: schema.reactions,
    pattern: schema.pattern,
  };
}

/**
 * 从 CompiledSchema 生成所有字段的 Props
 */
export function transformSchema(
  compiledSchema: CompiledSchema,
): {
  fields: Array<{ path: string; props: FieldProps; type: 'field' | 'array' | 'void' }>;
} {
  const fields: Array<{ path: string; props: FieldProps; type: 'field' | 'array' | 'void' }> = [];

  for (const [path, compiled] of compiledSchema.fields) {
    /* 跳过通配符项（数组内部项由 ArrayField 处理） */
    if (path.includes('.*')) continue;

    if (compiled.isVoid) {
      fields.push({
        path,
        props: toVoidFieldProps(compiled) as unknown as FieldProps,
        type: 'void',
      });
    } else if (compiled.isArray) {
      fields.push({
        path,
        props: toArrayFieldProps(compiled),
        type: 'array',
      });
    } else {
      fields.push({
        path,
        props: toFieldProps(compiled),
        type: 'field',
      });
    }
  }

  return { fields };
}
