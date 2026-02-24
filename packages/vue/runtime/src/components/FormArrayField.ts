import type { ArrayFieldInstance, ArrayFieldProps } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, onMounted, provide } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'
import { ReactiveField } from './ReactiveField'

/**
 * 数组字段组件（参考 Formily ArrayField）
 *
 * 创建 ArrayField 实例并通过 ReactiveField 桥接渲染。
 *
 * 渲染策略：
 * 1. **有 component（schema 模式）**：ReactiveField 解析 component（如 ArrayField）
 *    并渲染，组件内部通过 inject(FieldSymbol) 访问数组字段实例。
 * 2. **有 slot（自定义渲染）**：将 field 实例暴露给用户插槽。
 * 3. **无 slot 无 component**：保持空渲染（由 UI 层决定默认数组呈现方式）。
 *
 * @example schema 模式（由 SchemaField 调用）
 * ```vue
 * <FormArrayField name="contacts" :field-props="{
 *   component: 'ArrayField',
 *   componentProps: { itemsSchema: { type: 'object', properties: { ... } } },
 * }" />
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
  /**
   * 创建数组字段实例并桥接到统一渲染管线。
   * 该组件负责字段生命周期和上下文注入，不直接关心具体 UI 呈现。
   *
   * @param props 组件属性，包含字段路径和字段配置。
   * @param context setup 上下文，用于读取插槽函数。
   * @returns 返回渲染函数，输出 ReactiveField 或用户自定义插槽。
   */
  setup(props, context) {
    const { slots } = context
    const form = inject(FormSymbol)

    if (!form) {
      throw new Error('[ConfigForm] <FormArrayField> 必须在 <FormProvider> 内部使用')
    }

    let field = form.getArrayField(props.name) as ArrayFieldInstance | undefined
    let createdByThis = false
    if (!field) {
      field = form.createArrayField({ name: props.name, ...props.fieldProps })
      createdByThis = true
    }

    /* ArrayFieldInstance 继承自 Field，类型兼容 FieldInstance */
    provide(FieldSymbol, field as any)

    onMounted(() => {
      field!.mount()
    })

    /* 组件卸载时清理由本组件创建的字段注册 */
    onBeforeUnmount(() => {
      field!.unmount()
      if (createdByThis) {
        form.removeField(props.name)
      }
    })

    return () => {
      const hasSlot = !!slots.default

      /* 通过 ReactiveField 统一渲染管线：decorator 包装 + 状态传播 */
      return h(ReactiveField, {
        field: field as any,
        isVoid: false,
        isArray: true,
      }, {
        /* 自定义渲染：将 field 暴露给用户插槽 */
        ...(hasSlot
          ? {
              /** 默认插槽：向业务侧暴露数组字段实例和渲染上下文。 */
              default: (renderProps: Record<string, unknown>) => slots.default!({
                field,
                arrayField: field,
                ...renderProps,
              }),
            }
          : {}),
      })
    }
  },
})
