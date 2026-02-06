import { inject } from 'vue';
import type { FieldInstance } from '@moluoxixi/core';
import { FieldSymbol, FormSymbol } from '../context';

/**
 * 获取当前字段上下文
 */
export function useField<Value = unknown>(): FieldInstance<Value> {
  const field = inject(FieldSymbol);
  if (!field) {
    throw new Error('[ConfigForm] useField 必须在 <FormField> 内部使用');
  }
  return field as FieldInstance<Value>;
}

/**
 * 通过路径获取指定字段
 */
export function useFieldByPath<Value = unknown>(path: string): FieldInstance<Value> | undefined {
  const form = inject(FormSymbol);
  if (!form) {
    throw new Error('[ConfigForm] useFieldByPath 必须在 <FormProvider> 内部使用');
  }
  return form.getField(path) as FieldInstance<Value> | undefined;
}
