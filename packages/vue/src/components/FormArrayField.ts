import type { ArrayFieldInstance, ArrayFieldProps } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { defineComponent, h, inject, onBeforeUnmount, provide } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'
import { ArrayBase } from './ArrayBase'
import { FormField } from './FormField'
import { ReactiveField } from './ReactiveField'

/**
 * 数组字段组件（参考 Formily ArrayField）
 *
 * 创建 ArrayField 实例并通过 ReactiveField 桥接渲染。
 *
 * 渲染策略：
 * 1. **有 component（schema 模式）**：ReactiveField 解析 component（如 ArrayItems）
 *    并渲染，组件内部通过 inject(FieldSymbol) 访问数组字段实例。
 * 2. **有 slot（自定义渲染）**：将 field 实例暴露给用户插槽。
 * 3. **无 slot 无 component（field 模式默认）**：使用 ArrayBase 自动渲染
 *    数组项和操作按钮，基于 itemTemplate 推断子字段。
 *
 * @example schema 模式（由 SchemaField 调用）
 * ```vue
 * <FormArrayField name="contacts" :field-props="{
 *   component: 'ArrayItems',
 *   componentProps: { itemsSchema: { type: 'object', properties: { ... } } },
 * }" />
 * ```
 *
 * @example field 模式（自动渲染）
 * ```vue
 * <FormArrayField name="contacts" :field-props="{
 *   label: '联系人',
 *   minItems: 1, maxItems: 8,
 *   itemTemplate: () => ({ name: '', phone: '' }),
 * }" />
 * ```
 *
 * @example field 模式（自定义 slot + ArrayBase）
 * ```vue
 * <FormArrayField name="contacts" v-slot="{ field }">
 *   <ArrayBase>
 *     <ArrayBase.Item v-for="(_, idx) in field.value" :key="idx" :index="idx">
 *       <ArrayBase.Index />
 *       <FormField :name="`contacts.${idx}.name`" />
 *       <ArrayBase.Remove />
 *     </ArrayBase.Item>
 *     <ArrayBase.Addition />
 *   </ArrayBase>
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

    let field = form.getArrayField(props.name) as ArrayFieldInstance | undefined
    let createdByThis = false
    if (!field) {
      field = form.createArrayField({ name: props.name, ...props.fieldProps })
      createdByThis = true
    }

    /* ArrayFieldInstance 继承自 Field，类型兼容 FieldInstance */
    provide(FieldSymbol, field as any)

    /* 组件卸载时清理由本组件创建的字段注册 */
    onBeforeUnmount(() => {
      if (createdByThis) {
        form.removeField(props.name)
      }
    })

    return () => {
      const hasComponent = !!field!.component
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
              default: (renderProps: Record<string, unknown>) => slots.default!({
                field,
                arrayField: field,
                ...renderProps,
              }),
            }
          : {}),
        /* 无 component 且无 slot（field 模式默认）：使用 ArrayBase 渲染 */
        ...(!hasComponent && !hasSlot
          ? {
              default: () => renderDefaultArrayItems(field!, props),
            }
          : {}),
      })
    }
  },
})

/**
 * 默认数组项渲染（field 模式）
 *
 * 当 FormArrayField 既没有注册 component（非 schema 模式），
 * 也没有用户 slot 时，基于 itemTemplate 自动渲染。
 */
function renderDefaultArrayItems(field: ArrayFieldInstance, props: { name: string, fieldProps?: Partial<ArrayFieldProps> }) {
  const arrayValue = Array.isArray(field.value) ? field.value : []
  const form = field.form
  const pattern = field.pattern || form?.pattern || 'editable'
  const isEditable = pattern === 'editable'
  const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

  /* 从 itemTemplate 推断字段 key */
  const template = resolveItemTemplate(props.fieldProps?.itemTemplate)
  const itemKeys = Object.keys(template)

  const items = arrayValue.map((_, index) => {
    return h(ArrayBase.Item, { key: index, index }, {
      default: () => h('div', {
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginBottom: '8px',
          padding: '12px',
          background: index % 2 === 0 ? '#fafafa' : '#fff',
          borderRadius: '4px',
          border: '1px solid #ebeef5',
        },
      }, [
        h(ArrayBase.Index),
        h('div', { style: { flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          itemKeys.length > 0
            ? itemKeys.map(key => h(FormField, {
                key: `${props.name}.${index}.${key}`,
                name: `${props.name}.${index}.${key}`,
                fieldProps: {
                  label: key,
                  component: 'Input',
                  componentProps: { placeholder: key, size: 'small' },
                },
              }))
            : [h(FormField, {
                key: `${props.name}.${index}`,
                name: `${props.name}.${index}`,
                fieldProps: { component: 'Input', componentProps: { size: 'small' } },
              })],
        ),
        /* 始终渲染按钮容器保持占位，非编辑态隐藏但保留空间 */
        h('div', {
          style: {
            display: 'flex',
            gap: '4px',
            flexShrink: '0',
            visibility: isEditable ? 'visible' : 'hidden',
          },
        }, [
          h(ArrayBase.MoveUp),
          h(ArrayBase.MoveDown),
          h(ArrayBase.Remove),
        ]),
      ]),
    })
  })

  return h(ArrayBase, null, {
    default: () => h('div', { style: { width: '100%' } }, [
      h('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        },
      }, [
        h('span', { style: { fontWeight: 600, color: '#303133' } },
          field.label || props.name),
        h('span', { style: { color: '#909399', fontSize: '13px' } },
          `${arrayValue.length} / ${maxItems}`),
      ]),
      ...items,
      isEditable && h('div', { style: { marginTop: '4px' } }, [
        h(ArrayBase.Addition),
      ]),
    ]),
  })
}

/** 解析 itemTemplate 为普通对象 */
function resolveItemTemplate(template: unknown): Record<string, unknown> {
  if (!template) return {}
  const resolved = typeof template === 'function' ? (template as () => unknown)() : template
  if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) {
    return resolved as Record<string, unknown>
  }
  return {}
}
