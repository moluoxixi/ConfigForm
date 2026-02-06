import React, { useContext, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { FieldInstance, FieldProps } from '@moluoxixi/core';
import { FormContext, FieldContext, ComponentRegistryContext } from '../context';
import type { ComponentType, ReactNode } from 'react';

export interface FormFieldProps {
  /** 字段名 */
  name: string;
  /** 字段配置（可覆盖 schema 中的配置） */
  fieldProps?: Partial<FieldProps>;
  /** 自定义渲染 */
  children?: ReactNode | ((field: FieldInstance) => ReactNode);
  /** 覆盖组件 */
  component?: ComponentType<any>;
}

/**
 * 表单字段组件
 *
 * 自动从 Form 中获取/创建 Field，并注入 FieldContext。
 * 支持两种渲染模式：
 * 1. 自动渲染（根据注册表查找组件）
 * 2. 自定义渲染（children render prop）
 */
export const FormField = observer<FormFieldProps>(({ name, fieldProps, children, component }) => {
  const form = useContext(FormContext);
  const registry = useContext(ComponentRegistryContext);

  if (!form) {
    throw new Error('[ConfigForm] <FormField> 必须在 <FormProvider> 内部使用');
  }

  /* 获取或创建字段 */
  const fieldRef = useRef<FieldInstance | null>(null);
  if (!fieldRef.current) {
    let field = form.getField(name);
    if (!field) {
      field = form.createField({ name, ...fieldProps });
    }
    fieldRef.current = field;
  }
  const field = fieldRef.current;

  /* 组件卸载时不销毁字段（保持数据），除非表单销毁 */

  /* 不可见时不渲染 */
  if (!field.visible) return null;

  /* 自定义渲染 */
  if (typeof children === 'function') {
    return (
      <FieldContext.Provider value={field}>
        {children(field)}
      </FieldContext.Provider>
    );
  }

  /* 有子节点直接渲染 */
  if (children) {
    return (
      <FieldContext.Provider value={field}>
        {children}
      </FieldContext.Provider>
    );
  }

  /* 自动组件渲染 */
  const Component = component ?? (
    typeof field.component === 'string'
      ? registry.components.get(field.component)
      : field.component as ComponentType<any>
  );

  const Wrapper = typeof field.wrapper === 'string'
    ? registry.wrappers.get(field.wrapper)
    : field.wrapper as ComponentType<any> | undefined;

  if (!Component) {
    console.warn(`[ConfigForm] 字段 "${name}" 未找到组件 "${String(field.component)}"`);
    return null;
  }

  const fieldElement = (
    <Component
      value={field.value}
      onChange={(val: unknown) => field.setValue(val)}
      onFocus={() => field.focus()}
      onBlur={() => {
        field.blur();
        field.validate('blur').catch(() => {});
      }}
      disabled={field.disabled}
      readOnly={field.readOnly}
      loading={field.loading}
      dataSource={field.dataSource}
      {...field.componentProps}
    />
  );

  const wrappedElement = Wrapper ? (
    <Wrapper
      label={field.label}
      required={field.required}
      errors={field.errors}
      warnings={field.warnings}
      description={field.description}
      {...field.wrapperProps}
    >
      {fieldElement}
    </Wrapper>
  ) : fieldElement;

  return (
    <FieldContext.Provider value={field}>
      {wrappedElement}
    </FieldContext.Provider>
  );
});
