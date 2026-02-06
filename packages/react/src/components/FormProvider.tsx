import React from 'react';
import { observer } from 'mobx-react-lite';
import type { FormInstance } from '@moluoxixi/core';
import { FormContext, ComponentRegistryContext } from '../context';
import { getGlobalRegistry } from '../registry';
import type { ComponentType, ReactNode } from 'react';

export interface FormProviderProps {
  form: FormInstance;
  /** 局部组件注册（优先于全局） */
  components?: Record<string, ComponentType<any>>;
  /** 局部装饰器注册 */
  wrappers?: Record<string, ComponentType<any>>;
  children: ReactNode;
}

/**
 * 表单提供者组件
 *
 * 将 Form 实例注入 React 上下文，供子组件消费。
 */
export const FormProvider = observer<FormProviderProps>(({ form, components, wrappers, children }) => {
  const globalRegistry = getGlobalRegistry();

  const registry = React.useMemo(() => {
    const mergedComponents = new Map(globalRegistry.components);
    const mergedWrappers = new Map(globalRegistry.wrappers);

    if (components) {
      for (const [name, comp] of Object.entries(components)) {
        mergedComponents.set(name, comp);
      }
    }
    if (wrappers) {
      for (const [name, wrapper] of Object.entries(wrappers)) {
        mergedWrappers.set(name, wrapper);
      }
    }

    return { components: mergedComponents, wrappers: mergedWrappers };
  }, [components, wrappers, globalRegistry]);

  return (
    <FormContext.Provider value={form}>
      <ComponentRegistryContext.Provider value={registry}>
        {children}
      </ComponentRegistryContext.Provider>
    </FormContext.Provider>
  );
});
