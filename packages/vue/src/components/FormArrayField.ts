import type { ArrayFieldProps } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { defineComponent, inject, onBeforeUnmount, provide } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'

/**
 * 数组字段组件
 *
 * @example
 * ```vue
 * <FormArrayField name="contacts" v-slot="{ field }">
 *   <div v-for="(item, index) in field.value" :key="index">
 *     <FormField :name="`contacts.${index}.name`" />
 *     <button @click="field.remove(index)">删除</button>
 *   </div>
 *   <button @click="field.push({})">添加</button>
 * </FormArrayField>
 * ```
 */
export const FormArrayField = defineComponent({
  name: 'FormArrayField',
  props: {
    name: {
      type: String,
      required: true,
    },
    fieldProps: {
      type: Object as PropType<Partial<ArrayFieldProps>>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const form = inject(FormSymbol)

    if (!form) {
      throw new Error('[ConfigForm] <FormArrayField> 必须在 <FormProvider> 内部使用')
    }

    let field = form.getArrayField(props.name)
    let createdByThis = false
    if (!field) {
      field = form.createArrayField({ name: props.name, ...props.fieldProps })
      createdByThis = true
    }

    provide(FieldSymbol, field)

    /* 组件卸载时清理由本组件创建的字段注册 */
    onBeforeUnmount(() => {
      if (createdByThis) {
        form.removeField(props.name)
      }
    })

    return () => {
      if (!field!.visible)
        return null

      if (slots.default) {
        return slots.default({ field, arrayField: field })
      }
      return null
    }
  },
})
