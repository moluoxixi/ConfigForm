import type { FieldProps } from '@moluoxixi/core'
import type { Component, PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, provide } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'
import { ReactiveField } from './ReactiveField'

/**
 * 表单字段组件
 *
 * 自动从 Form 中获取/创建 Field，通过 ReactiveField 桥接渲染。
 * 支持两种渲染模式：
 * 1. 自定义插槽：`v-slot="{ field, isReadOnly, isDisabled }"`
 * 2. 自动渲染：根据 field.component + field.wrapper 从 registry 查找组件
 */
export const FormField = defineComponent({
  name: 'FormField',
  props: {
    name: {
      type: String,
      required: true,
    },
    fieldProps: {
      type: Object as PropType<Partial<FieldProps>>,
      default: undefined,
    },
    component: {
      type: [String, Object, Function] as PropType<string | Component>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const form = inject(FormSymbol)

    if (!form) {
      throw new Error('[ConfigForm] <FormField> 必须在 <FormProvider> 内部使用')
    }

    /* 获取或创建字段 */
    let field = form.getField(props.name)
    let createdByThis = false
    if (!field) {
      const mergedProps: Record<string, unknown> = { ...props.fieldProps, name: props.name }
      if (!mergedProps.pattern && form.pattern !== 'editable') {
        mergedProps.pattern = form.pattern
      }
      field = form.createField(mergedProps as any)
      createdByThis = true
    }

    provide(FieldSymbol, field)

    onBeforeUnmount(() => {
      if (createdByThis) {
        form.removeField(props.name)
      }
    })

    return () => {
      /* 通过 ReactiveField 统一渲染 */
      return h(ReactiveField, {
        field: field as any,
        isVoid: false,
      }, slots)
    }
  },
})
