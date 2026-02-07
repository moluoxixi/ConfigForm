import type { FormInstance } from '@moluoxixi/core'
import type { ComponentType } from '@moluoxixi/shared'
import type { PropType } from 'vue'
import { computed, defineComponent, provide } from 'vue'
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
    wrappers: {
      type: Object as PropType<Record<string, ComponentType>>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    provide(FormSymbol, props.form)

    const registry = computed(() => {
      const global = getGlobalRegistry()
      const components = new Map(global.components)
      const wrappers = new Map(global.wrappers)

      if (props.components) {
        for (const [name, comp] of Object.entries(props.components)) {
          components.set(name, comp)
        }
      }
      if (props.wrappers) {
        for (const [name, wrapper] of Object.entries(props.wrappers)) {
          wrappers.set(name, wrapper)
        }
      }

      return { components, wrappers }
    })

    provide(ComponentRegistrySymbol, registry)

    return () => slots.default?.()
  },
})
