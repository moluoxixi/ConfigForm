import type { ArrayFieldProps } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, provide } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'
import { ReactiveField } from './ReactiveField'

/**
 * 数组字段组件
 *
 * 通过 ReactiveField 桥接渲染，获得 decorator（FormItem）包装和
 * disabled/readOnly 状态自动传播。在 Config 模式下自动获得标签和错误提示。
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
      /* 通过 ReactiveField 统一渲染管线：decorator 包装 + 状态传播 */
      return h(ReactiveField, {
        field: field as any,
        isVoid: false,
      }, {
        /* 自定义渲染：将 field 暴露给用户插槽 */
        default: slots.default
          ? (renderProps: Record<string, unknown>) => slots.default!({
              field,
              arrayField: field,
              ...renderProps,
            })
          : undefined,
      })
    }
  },
})
