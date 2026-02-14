import type { InjectionKey, PropType, Ref } from 'vue'
import { computed, defineComponent, inject, provide } from 'vue'

export interface FormLayoutConfig {
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: string | number
  colon?: boolean
}

export type FormLayoutContext = Readonly<Ref<FormLayoutConfig>>

export const FormLayoutSymbol: InjectionKey<FormLayoutContext> = Symbol('ConfigFormLayout')

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
