import type { VoidFieldProps } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, onMounted, provide, watch } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'
import { ReactiveField } from './ReactiveField'

/**
 * 虚拟字段组件（参考 Formily VoidField）
 *
 * 创建 VoidField 实例但不参与数据收集。
 * 用于布局容器（Card / Collapse / Tabs 等），通过 component 属性指定渲染的容器组件。
 *
 * @example
 * ```vue
 * <FormVoidField name="cardGroup" :field-props="{ component: 'Card', componentProps: { title: '分组' } }">
 *   <template #children>
 *     <FormField name="username" />
 *   </template>
 * </FormVoidField>
 * ```
 */
export const FormVoidField = defineComponent({
  name: 'FormVoidField',
  props: {
    name: {
      type: String,
      required: true,
    },
    fieldProps: {
      type: Object as PropType<Partial<VoidFieldProps>>,
      default: undefined,
    },
  },
  /**
   * setup：初始化组件渲染上下文。
   * @param props 参数 props 为当前功能所需的输入信息。
   */
  setup(props, { slots }) {
    const form = inject(FormSymbol)

    if (!form) {
      throw new Error('[ConfigForm] <FormVoidField> 必须在 <FormProvider> 内部使用')
    }

    /* 获取或创建 VoidField */
    let field = form.getAllVoidFields().get(props.name) ?? undefined
    let createdByThis = false
    if (!field) {
      field = form.createVoidField({
        name: props.name,
        ...props.fieldProps,
      })
      createdByThis = true
    }

    /* pattern 无需手动继承，field.pattern getter 已自动回退到 form.pattern */
    watch(
      () => props.fieldProps,
      (nextProps) => {
        if (!nextProps || !field)
          return
        if (nextProps.label !== undefined)
          field.label = nextProps.label ?? ''
        if (nextProps.visible !== undefined)
          field.visible = nextProps.visible ?? true
        if (nextProps.disabled !== undefined)
          field.disabled = nextProps.disabled ?? false
        if (nextProps.preview !== undefined)
          field.preview = nextProps.preview ?? false
        if (nextProps.pattern !== undefined)
          field.pattern = nextProps.pattern
        if (nextProps.component !== undefined)
          field.component = nextProps.component ?? ''
        if (nextProps.componentProps) {
          field.componentProps = { ...field.componentProps, ...nextProps.componentProps }
        }
      },
      { deep: true },
    )

    provide(FieldSymbol, field as any)

    onMounted(() => {
      field!.mount()
    })

    onBeforeUnmount(() => {
      field!.unmount()
      if (createdByThis) {
        form.removeField(props.name)
      }
    })

    return () => {
      return h(ReactiveField, {
        field: field as any,
        isVoid: true,
      }, {
        /* children 插槽：传递给 ReactiveField 作为容器组件的子内容 */
        children: () => slots.default?.(),
      })
    }
  },
})
