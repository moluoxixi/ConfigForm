import type { FieldProps } from '@moluoxixi/core'
import type { Component, PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, provide } from 'vue'
import { ComponentRegistrySymbol, FieldSymbol, FormSymbol } from '../context'

/**
 * 表单字段组件
 *
 * 自动从 Form 中获取/创建 Field，注入 FieldContext。
 * Vue 模板中直接使用 field 的响应式属性即可自动更新。
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
    const registry = inject(ComponentRegistrySymbol)

    if (!form) {
      throw new Error('[ConfigForm] <FormField> 必须在 <FormProvider> 内部使用')
    }

    /* 获取或创建字段 */
    let field = form.getField(props.name)
    let createdByThis = false
    if (!field) {
      /* 字段 pattern 继承表单级 pattern（schema.pattern 优先） */
      const mergedProps: Record<string, unknown> = { ...props.fieldProps, name: props.name }
      if (!mergedProps.pattern && form.pattern !== 'editable') {
        mergedProps.pattern = form.pattern
      }
      field = form.createField(mergedProps as any)
      createdByThis = true
    }

    provide(FieldSymbol, field)

    /* 组件卸载时清理由本组件创建的字段注册，避免数组项删除后残留脏字段 */
    onBeforeUnmount(() => {
      if (createdByThis) {
        form.removeField(props.name)
      }
    })

    return () => {
      if (!field!.visible)
        return null

      /**
       * 根据 pattern 计算有效的交互状态（v-slot 和自动渲染共用）
       * 优先级：字段级 > 字段 pattern > 表单 pattern
       */
      const fp = field!.pattern
      const formP = form.pattern
      const isDisabled = field!.disabled || fp === 'disabled' || formP === 'disabled'
      const isReadOnly = field!.readOnly || fp === 'readOnly' || formP === 'readOnly'

      /* 自定义插槽渲染：传递 field + 计算后的交互状态 */
      if (slots.default) {
        return slots.default({ field, isReadOnly, isDisabled })
      }

      /* 自动组件渲染 */
      const componentName = props.component ?? field!.component
      let Component: Component | undefined

      if (typeof componentName === 'string') {
        Component = registry?.components.get(componentName) as Component | undefined
      }
      else {
        Component = componentName as Component
      }

      if (!Component) {
        console.warn(`[ConfigForm] 字段 "${props.name}" 未找到组件 "${String(componentName)}"`)
        return null
      }

      const wrapperName = field!.wrapper
      let Wrapper: Component | undefined
      if (typeof wrapperName === 'string' && wrapperName) {
        Wrapper = registry?.wrappers.get(wrapperName) as Component | undefined
      }

      const fieldElement = h(Component as Component, {
        'modelValue': field!.value,
        'onUpdate:modelValue': (val: unknown) => field!.setValue(val),
        'onFocus': () => field!.focus(),
        'onBlur': () => {
          field!.blur()
          field!.validate('blur').catch(() => {})
        },
        'disabled': isDisabled,
        'readonly': isReadOnly,
        'loading': field!.loading,
        'dataSource': field!.dataSource,
        ...field!.componentProps,
      })

      if (Wrapper) {
        return h(Wrapper as Component, {
          label: field!.label,
          required: field!.required,
          errors: field!.errors,
          warnings: field!.warnings,
          description: field!.description,
          labelPosition: form.labelPosition,
          labelWidth: form.labelWidth,
          ...field!.wrapperProps,
        }, () => fieldElement)
      }

      return fieldElement
    }
  },
})
