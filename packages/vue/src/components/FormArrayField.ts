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
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/vue/src/components/FormArrayField.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param param2 原始解构参数（{ slots }）用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, { slots }) {
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
              /**
               * default：执行当前功能逻辑。
               *
               * @param renderProps 参数 renderProps 的输入说明。
               *
               * @returns 返回当前功能的处理结果。
               */

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
