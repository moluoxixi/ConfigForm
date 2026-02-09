import type { VoidFieldProps } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, provide } from 'vue'
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

    provide(FieldSymbol, field as any)

    onBeforeUnmount(() => {
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
