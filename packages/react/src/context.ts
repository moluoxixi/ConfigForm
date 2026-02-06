import { createContext } from 'react';
import type { FormInstance, FieldInstance } from '@moluoxixi/core';

/** 表单上下文 */
export const FormContext = createContext<FormInstance | null>(null);
FormContext.displayName = 'ConfigFormContext';

/** 字段上下文 */
export const FieldContext = createContext<FieldInstance | null>(null);
FieldContext.displayName = 'ConfigFieldContext';

/**
 * 组件注册表上下文
 * 用于 Schema 驱动模式下的组件查找
 */
export interface ComponentRegistry {
  components: Map<string, React.ComponentType<any>>;
  wrappers: Map<string, React.ComponentType<any>>;
}

export const ComponentRegistryContext = createContext<ComponentRegistry>({
  components: new Map(),
  wrappers: new Map(),
});
ComponentRegistryContext.displayName = 'ConfigComponentRegistryContext';
