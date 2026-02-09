import type { FormInstance } from '@moluoxixi/core'
import type { ComponentType, ReactNode } from 'react'
import { observer } from '@moluoxixi/reactive-react'
import React, { useEffect } from 'react'
import { ComponentRegistryContext, FormContext } from '../context'
import { getGlobalRegistry } from '../registry'

export interface FormProviderProps {
  form: FormInstance
  /** 局部组件注册（优先于全局） */
  components?: Record<string, ComponentType<any>>
  /** 局部装饰器注册 */
  decorators?: Record<string, ComponentType<any>>
  children: ReactNode
}

/**
 * 表单提供者组件
 *
 * 将 Form 实例注入 React 上下文，供子组件消费。
 */
export const FormProvider = observer<FormProviderProps>(({ form, components, decorators, children }) => {
  const globalRegistry = getGlobalRegistry()

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

    return { components: mergedComponents, decorators: mergedDecorators }
  }, [components, decorators, globalRegistry])

  return (
    <FormContext.Provider value={form}>
      <ComponentRegistryContext.Provider value={registry}>
        {children}
      </ComponentRegistryContext.Provider>
    </FormContext.Provider>
  )
})
