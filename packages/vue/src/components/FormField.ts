import type { FieldProps } from '@moluoxixi/core'
import type { Component, PropType } from 'vue'
import { defineComponent, h, inject, provide } from 'vue'
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
    if (!field) {
      /* 字段 pattern 继承表单级 pattern（schema.pattern 优先） */
      const mergedProps: Record<string, unknown> = { name: props.name, ...props.fieldProps }
      if (!mergedProps.pattern && form.pattern !== 'editable') {
        mergedProps.pattern = form.pattern
      }
      field = form.createField(mergedProps as any)
    }

    provide(FieldSymbol, field)

    return () => {
      if (!field!.visible)
        return null

      /* 自定义插槽渲染 */
      if (slots.default) {
        return slots.default({ field })
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

      /**
       * 根据 pattern 计算有效的交互状态
       * - disabled: pattern === 'disabled' 或字段级 disabled
       * - readOnly: pattern === 'readOnly' 或字段级 readOnly
       * 组件适配层负责将 readonly 映射为合适的行为（如不支持则降级为 disabled）
       */
      const effectivePattern = field!.pattern
      const isDisabled = field!.disabled || effectivePattern === 'disabled'
      const isReadOnly = field!.readOnly || effectivePattern === 'readOnly'

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
