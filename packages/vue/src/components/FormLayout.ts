import type { InjectionKey, PropType, Ref } from 'vue'
import { computed, defineComponent, inject, provide } from 'vue'

/**
 * Form Layout Config：类型接口定义。
 * 所属模块：`packages/vue/src/components/FormLayout.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormLayoutConfig {
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: string | number
  colon?: boolean
}

/**
 * Form Layout Context：类型别名定义。
 * 所属模块：`packages/vue/src/components/FormLayout.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type FormLayoutContext = Readonly<Ref<FormLayoutConfig>>

/**
 * Form Layout Symbol：变量或常量声明。
 * 所属模块：`packages/vue/src/components/FormLayout.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const FormLayoutSymbol: InjectionKey<FormLayoutContext> = Symbol('ConfigFormLayout')

/**
 * use Form Layout：当前功能模块的核心执行单元。
 * 所属模块：`packages/vue/src/components/FormLayout.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function useFormLayout(): FormLayoutContext | null {
  return inject(FormLayoutSymbol, null)
}

/**
 * Form Layout：变量或常量声明。
 * 所属模块：`packages/vue/src/components/FormLayout.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
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
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/vue/src/components/FormLayout.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param param2 原始解构参数（{ slots }）用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
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
