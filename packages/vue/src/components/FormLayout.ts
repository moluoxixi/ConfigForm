import type { InjectionKey, PropType, Ref } from 'vue'
import { computed, defineComponent, inject, provide } from 'vue'

/**
 * FormLayout 可覆盖的布局配置。
 */
export interface FormLayoutConfig {
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: string | number
  colon?: boolean
}

/**
 * FormLayout 上下文类型。
 * 通过 `computed` 包装，保证嵌套覆盖时具备响应式继承能力。
 */
export type FormLayoutContext = Readonly<Ref<FormLayoutConfig>>

/**
 * FormLayout 注入键。
 */
export const FormLayoutSymbol: InjectionKey<FormLayoutContext> = Symbol('ConfigFormLayout')

/**
 * 读取最近一层 FormLayout 上下文。
 * @returns 返回最近一层布局配置；未声明布局时返回 `null`。
 */
export function useFormLayout(): FormLayoutContext | null {
  return inject(FormLayoutSymbol, null)
}

/**
 * FormLayout 组件。
 * 在局部作用域覆盖 `labelPosition/labelWidth/colon`，并向下传递。
 */
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
  /**
   * 组合父子布局配置并通过 provide 向下游节点传递。
   *
   * @param props 当前节点传入的布局覆盖配置。
   * @param context setup 上下文，用于访问默认插槽。
   * @returns 返回渲染函数，输出默认插槽内容。
   */
  setup(props, context) {
    const { slots } = context
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
