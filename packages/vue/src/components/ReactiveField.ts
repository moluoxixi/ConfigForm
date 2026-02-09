import type { ArrayFieldInstance, FieldInstance, FormInstance, VoidFieldInstance } from '@moluoxixi/core'
import type { Component, PropType, VNode } from 'vue'
import { defineComponent, h, inject } from 'vue'
import { ComponentRegistrySymbol, FormSymbol } from '../context'
import { getReadPrettyComponent } from '../registry'

/**
 * 响应式字段渲染桥接（参考 Formily ReactiveField）
 *
 * 统一处理所有字段类型的渲染管线：
 * - 判断 visible（不可见则不渲染）
 * - 渲染 decorator（FormItem 等包装器）
 * - 渲染 component（Input / Card / ArrayItems 等业务组件）
 * - 注入字段属性（value / disabled / readonly / loading / dataSource 等）
 *
 * 对于数组字段（isArray=true），不传 modelValue/onUpdate:modelValue，
 * 而是将组件作为容器渲染（如 ArrayItems），由组件内部通过 inject 访问字段实例。
 *
 * 由 FormField / FormVoidField / FormArrayField 调用，不直接在模板中使用。
 */
export const ReactiveField = defineComponent({
  name: 'ReactiveField',
  props: {
    /** 字段实例（Field / VoidField / ArrayField） */
    field: {
      type: Object as PropType<FieldInstance | VoidFieldInstance>,
      required: true,
    },
    /** 是否是 void 字段（不绑定数据） */
    isVoid: {
      type: Boolean,
      default: false,
    },
    /** 是否是数组字段 */
    isArray: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const form = inject(FormSymbol) as FormInstance
    const registryRef = inject(ComponentRegistrySymbol)

    /** 从 registry 查找组件 */
    function resolveComp(name: string | unknown): Component | null {
      if (typeof name === 'string') {
        return (registryRef?.value.components.get(name) as Component) ?? null
      }
      return (name as Component) ?? null
    }

    /** 从 registry 查找装饰器 */
    function resolveDecorator(name: string | unknown): Component | null {
      if (typeof name === 'string') {
        return (registryRef?.value.decorators.get(name) as Component) ?? null
      }
      return (name as Component) ?? null
    }

    return () => {
      const field = props.field
      if (!field)
        return null

      /* 不可见则不渲染 */
      if (!field.visible)
        return null

      try {
      /* pattern 判断已收敛到 field 模型的计算属性，消费者直接读结论 */
      const isDisabled = !props.isVoid && (field as FieldInstance).effectiveDisabled
      const isReadOnly = !props.isVoid && (field as FieldInstance).effectiveReadOnly
      const isPreview = isReadOnly

      /* ---- 自定义插槽优先 ---- */
      if (slots.default) {
        return slots.default({ field, isReadOnly, isDisabled })
      }

      /* ---- 自动渲染：component ---- */
      const componentName = field.component
      const Comp = resolveComp(componentName)

      if (!Comp && !props.isVoid && !props.isArray) {
        console.warn(`[ConfigForm] 字段 "${field.path}" 未找到组件 "${String(componentName)}"`)
        return h('div', {
          style: 'color: #ff4d4f; padding: 8px 12px; border: 1px dashed #ff4d4f; border-radius: 4px; font-size: 12px; background: #fff2f0;',
        }, `⚠ 组件 "${String(componentName)}" 未注册`)
      }

      let componentNode: VNode | VNode[] | null = null

      if (props.isVoid) {
        /* void 字段：component 作为容器，children 来自 slots.children */
        if (Comp) {
          componentNode = h(Comp, { ...field.componentProps }, () => slots.children?.())
        }
        else {
          /* 无组件的 void 节点：透明容器 */
          componentNode = slots.children?.() ?? null
        }
      }
      else if (props.isArray) {
        /*
         * 数组字段（参考 Formily）：
         * 不传 modelValue/onUpdate:modelValue，组件（如 ArrayItems）
         * 通过 inject(FieldSymbol) 访问 ArrayField 实例。
         */
        const arrayField = field as unknown as ArrayFieldInstance
        if (Comp) {
          componentNode = h(Comp, {
            ...arrayField.componentProps,
          })
        }
        else {
          /* 无注册组件时：渲染子插槽或空 */
          componentNode = slots.children?.() ?? null
        }
      }
      else {
        /* 数据字段：注入 value / events / 状态 */
        const dataField = field as FieldInstance

        /* readOnly 模式：查找 readPretty 替代组件，用纯文本替换输入框 */
        if (isPreview) {
          const compName = typeof componentName === 'string' ? componentName : ''
          const ReadPrettyComp = compName ? getReadPrettyComponent(compName) : undefined
          if (ReadPrettyComp) {
            componentNode = h(ReadPrettyComp as Component, {
              'modelValue': dataField.value,
              'dataSource': dataField.dataSource,
              ...dataField.componentProps,
            })
          }
        }

        /* 无 readPretty 替代或非阅读态：渲染原组件 */
        if (!componentNode) {
          componentNode = h(Comp!, {
            'modelValue': dataField.value,
            'onUpdate:modelValue': (val: unknown) => dataField.onInput(val),
            'onFocus': () => dataField.focus(),
            'onBlur': () => dataField.blur(),
            'disabled': isDisabled,
            'readonly': isReadOnly,
            'loading': dataField.loading,
            'dataSource': dataField.dataSource,
            ...dataField.componentProps,
          })
        }
      }

      /* ---- 自动渲染：decorator（包装器） ---- */
      const decoratorName = !props.isVoid ? (field as FieldInstance).decorator : undefined
      const Decorator = decoratorName ? resolveDecorator(decoratorName) : undefined

      if (Decorator && !props.isVoid) {
        const dataField = field as FieldInstance
        return h(Decorator, {
          label: dataField.label,
          required: dataField.required,
          errors: dataField.errors,
          warnings: dataField.warnings,
          description: dataField.description,
          labelPosition: form?.labelPosition,
          labelWidth: form?.labelWidth,
          pattern: dataField.pattern,
          ...dataField.decoratorProps,
        }, () => componentNode)
      }

      return componentNode
      }
      catch (err) {
        console.error(`[ConfigForm] 字段 "${field.path}" 渲染异常:`, err)
        return h('div', {
          style: 'color: #ff4d4f; padding: 8px 12px; border: 1px dashed #ff4d4f; border-radius: 4px; font-size: 12px; background: #fff2f0;',
        }, `⚠ 字段 "${field.path}" 渲染异常: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  },
})
