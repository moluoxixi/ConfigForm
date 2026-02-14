import type { FieldInstance, ObjectFieldInstance, ObjectFieldProps } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, onMounted, provide } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'
import { ReactiveField } from './ReactiveField'

/**
 * 对象字段组件
 *
 * 与普通 FormField 类似，但允许嵌套子字段。
 * 用于 type='object' 的 schema 节点。
 *
 * @example
 * ```vue
 * <FormObjectField name="profile" :field-props="{ label: '个人信息' }">
 *   <template #default>
 *     <FormField name="profile.name" />
 *     <FormField name="profile.age" />
 *   </template>
 * </FormObjectField>
 * ```
 */
export const FormObjectField = defineComponent({
  name: 'FormObjectField',
  props: {
    name: {
      type: String,
      required: true,
    },
    fieldProps: {
      type: Object as PropType<Partial<ObjectFieldProps>>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const form = inject(FormSymbol)

    if (!form) {
      throw new Error('[ConfigForm] <FormObjectField> 必须在 <FormProvider> 内部使用')
    }

    let field = form.getObjectField(props.name) as ObjectFieldInstance | undefined
    let createdByThis = false
    if (!field) {
      const mergedProps: ObjectFieldProps = { ...(props.fieldProps ?? {}), name: props.name }
      /* pattern 无需手动注入，field.pattern getter 已自动回退到 form.pattern */
      /* ObjectField 的初始值默认为空对象 */
      if (mergedProps.initialValue === undefined) {
        mergedProps.initialValue = {}
      }
      field = form.createObjectField(mergedProps)
      createdByThis = true
    }

    provide(FieldSymbol, field as unknown as FieldInstance)

    onMounted(() => {
      field.mount()
    })

    onBeforeUnmount(() => {
      field.unmount()
      if (createdByThis) {
        form.removeField(props.name)
      }
    })

    return () => {
      return h(ReactiveField, {
        field: field as any,
        isVoid: false,
      }, {
        /* 对象字段的 children 是其 properties 子字段 */
        children: () => slots.default?.(),
        default: slots.default,
      })
    }
  },
})
