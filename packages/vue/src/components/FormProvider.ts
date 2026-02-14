import type { ComponentType, FormInstance } from '@moluoxixi/core'
import type { Component, PropType } from 'vue'
import type { ComponentScope, RegistryState } from '../registry'
import { computed, defineComponent, onBeforeUnmount, onMounted, provide } from 'vue'
import { ComponentRegistrySymbol, FormSymbol } from '../context'
import { getGlobalRegistry } from '../registry'

/**
 * 表单提供者组件
 *
 * 将 Form 实例注入 Vue 上下文。
 * 由于使用了 @vue/reactivity，form.values 天然是响应式的。
 */
export const FormProvider = defineComponent({
  name: 'FormProvider',
  props: {
    form: {
      type: Object as PropType<FormInstance>,
      required: true,
    },
    components: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
    decorators: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
    defaultDecorators: {
      type: Object as PropType<Record<string, string>>,
      default: undefined,
    },
    readPrettyComponents: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
    scope: {
      type: Object as PropType<ComponentScope>,
      default: undefined,
    },
    registry: {
      type: Object as PropType<RegistryState>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    provide(FormSymbol, props.form)

    const registry = computed(() => {
      const global = props.registry ?? getGlobalRegistry()
      const components = new Map(global.components)
      const decorators = new Map(global.decorators)
      const defaultDecorators = new Map(global.defaultDecorators)
      const readPrettyComponents = new Map(global.readPrettyComponents)

      if (props.scope) {
        for (const [name, comp] of Object.entries(props.scope.components)) {
          components.set(name, comp as Component)
        }
        for (const [name, dec] of Object.entries(props.scope.decorators)) {
          decorators.set(name, dec as Component)
        }
        for (const [name, decoratorName] of Object.entries(props.scope.defaultDecorators ?? {})) {
          defaultDecorators.set(name, decoratorName)
        }
        for (const [name, comp] of Object.entries(props.scope.readPrettyComponents ?? {})) {
          readPrettyComponents.set(name, comp as Component)
        }
      }

      if (props.components) {
        for (const [name, comp] of Object.entries(props.components)) {
          components.set(name, comp as Component)
        }
      }
      if (props.decorators) {
        for (const [name, dec] of Object.entries(props.decorators)) {
          decorators.set(name, dec as Component)
        }
      }
      if (props.defaultDecorators) {
        for (const [name, decoratorName] of Object.entries(props.defaultDecorators)) {
          defaultDecorators.set(name, decoratorName)
        }
      }
      if (props.readPrettyComponents) {
        for (const [name, comp] of Object.entries(props.readPrettyComponents)) {
          readPrettyComponents.set(name, comp as Component)
        }
      }

      return { components, decorators, defaultDecorators, readPrettyComponents }
    })

    provide(ComponentRegistrySymbol, registry)

    /* 表单挂载/卸载生命周期 */
    onMounted(() => {
      props.form.mount()
    })

    onBeforeUnmount(() => {
      props.form.unmount()
    })

    return () => slots.default?.()
  },
})
