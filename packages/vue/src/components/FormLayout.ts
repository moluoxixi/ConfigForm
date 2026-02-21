import type { InjectionKey, PropType, Ref } from 'vue'
import { computed, defineComponent, inject, provide } from 'vue'

export interface FormLayoutConfig {
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: string | number
  colon?: boolean
}

export type FormLayoutContext = Readonly<Ref<FormLayoutConfig>>

export const FormLayoutSymbol: InjectionKey<FormLayoutContext> = Symbol('ConfigFormLayout')

/**
 * use Form Layout：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 use Form Layout 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function useFormLayout(): FormLayoutContext | null {
  return inject(FormLayoutSymbol, null)
}

export const FormLayout = defineComponent({
  name: 'FormLayout',
  props: {
    labelPosition: String as PropType<'top' | 'left' | 'right'>,
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    colon: {
      type: null as unknown as PropType<boolean | undefined>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const parentLayout = useFormLayout()

    const mergedConfig = computed<FormLayoutConfig>(() => ({
      labelPosition: props.labelPosition ?? parentLayout?.value.labelPosition,
      labelWidth: props.labelWidth ?? parentLayout?.value.labelWidth,
      colon: props.colon ?? parentLayout?.value.colon,
    }))

    provide(FormLayoutSymbol, mergedConfig)

    return () => slots.default?.()
  },
})
