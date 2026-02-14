import type { FormInstance } from '@moluoxixi/core'
import type { ComponentType, ReactNode } from 'react'
import type { ComponentScope, RegistryState } from '../registry'
import React, { useEffect } from 'react'
import { ComponentRegistryContext, FormContext } from '../context'
import { observer } from '../reactive'
import { getGlobalRegistry } from '../registry'

export interface FormProviderProps {
  form: FormInstance<any>
  /** 局部组件注册（优先于全局） */
  components?: Record<string, ComponentType<any>>
  /** 局部装饰器注册 */
  decorators?: Record<string, ComponentType<any>>
  /** 局部默认装饰器映射（component -> decorator） */
  defaultDecorators?: Record<string, string>
  /** 局部阅读态组件映射（component -> readPrettyComponent） */
  readPrettyComponents?: Record<string, ComponentType<any>>
  /** 作用域注册（可同时携带 components/decorators/defaultDecorators/readPrettyComponents） */
  scope?: ComponentScope
  /** 指定基础注册表（默认使用全局注册表） */
  registry?: RegistryState
  children: ReactNode
}

/**
 * 表单提供者组件
 *
 * 将 Form 实例注入 React 上下文，供子组件消费。
 */
export const FormProvider = observer<FormProviderProps>(({
  form,
  components,
  decorators,
  defaultDecorators,
  readPrettyComponents,
  scope,
  registry: baseRegistry,
  children,
}) => {
  const globalRegistry = baseRegistry ?? getGlobalRegistry()

  /* 表单挂载/卸载生命周期 */
  useEffect(() => {
    form.mount()
    return () => {
      form.unmount()
    }
  }, [form])

  const registry = React.useMemo(() => {
    const mergedComponents = new Map(globalRegistry.components)
    const mergedDecorators = new Map(globalRegistry.decorators)
    const mergedDefaultDecorators = new Map(globalRegistry.defaultDecorators)
    const mergedReadPrettyComponents = new Map(globalRegistry.readPrettyComponents)

    if (scope) {
      for (const [name, comp] of Object.entries(scope.components)) {
        mergedComponents.set(name, comp)
      }
      for (const [name, dec] of Object.entries(scope.decorators)) {
        mergedDecorators.set(name, dec)
      }
      for (const [name, decoratorName] of Object.entries(scope.defaultDecorators ?? {})) {
        mergedDefaultDecorators.set(name, decoratorName)
      }
      for (const [name, comp] of Object.entries(scope.readPrettyComponents ?? {})) {
        mergedReadPrettyComponents.set(name, comp)
      }
    }

    if (components) {
      for (const [name, comp] of Object.entries(components)) {
        mergedComponents.set(name, comp)
      }
    }
    if (decorators) {
      for (const [name, dec] of Object.entries(decorators)) {
        mergedDecorators.set(name, dec)
      }
    }
    if (defaultDecorators) {
      for (const [name, decoratorName] of Object.entries(defaultDecorators)) {
        mergedDefaultDecorators.set(name, decoratorName)
      }
    }
    if (readPrettyComponents) {
      for (const [name, comp] of Object.entries(readPrettyComponents)) {
        mergedReadPrettyComponents.set(name, comp)
      }
    }

    return {
      components: mergedComponents,
      decorators: mergedDecorators,
      defaultDecorators: mergedDefaultDecorators,
      readPrettyComponents: mergedReadPrettyComponents,
    }
  }, [components, decorators, defaultDecorators, readPrettyComponents, scope, globalRegistry])

  return (
    <FormContext.Provider value={form}>
      <ComponentRegistryContext.Provider value={registry}>
        {children}
      </ComponentRegistryContext.Provider>
    </FormContext.Provider>
  )
})
