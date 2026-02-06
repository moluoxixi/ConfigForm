import React, { useContext, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { ArrayFieldInstance, ArrayFieldProps } from '@moluoxixi/core';
import { FormContext, FieldContext } from '../context';
import type { ReactNode } from 'react';

export interface FormArrayFieldComponentProps {
  name: string;
  fieldProps?: Partial<ArrayFieldProps>;
  children: (field: ArrayFieldInstance) => ReactNode;
}

/**
 * 数组字段组件
 *
 * 提供 ArrayField 实例给子组件，支持增删改排序等操作。
 *
 * @example
 * ```tsx
 * <FormArrayField name="contacts">
 *   {(field) => (
 *     <div>
 *       {field.value?.map((_, index) => (
 *         <div key={index}>
 *           <FormField name={`contacts.${index}.name`} />
 *           <button onClick={() => field.remove(index)}>删除</button>
 *         </div>
 *       ))}
 *       <button onClick={() => field.push({})}>添加</button>
 *     </div>
 *   )}
 * </FormArrayField>
 * ```
 */
export const FormArrayField = observer<FormArrayFieldComponentProps>(
  ({ name, fieldProps, children }) => {
    const form = useContext(FormContext);

    if (!form) {
      throw new Error('[ConfigForm] <FormArrayField> 必须在 <FormProvider> 内部使用');
    }

    const fieldRef = useRef<ArrayFieldInstance | null>(null);
    if (!fieldRef.current) {
      let field = form.getArrayField(name);
      if (!field) {
        field = form.createArrayField({ name, ...fieldProps });
      }
      fieldRef.current = field;
    }
    const field = fieldRef.current;

    if (!field.visible) return null;

    return (
      <FieldContext.Provider value={field}>
        {children(field)}
      </FieldContext.Provider>
    );
  },
);
