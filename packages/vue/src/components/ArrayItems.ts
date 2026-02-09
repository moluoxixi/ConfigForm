import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ISchema } from '@moluoxixi/core'
import type { PropType, VNode } from 'vue'
import { defineComponent, h, inject } from 'vue'
import { FieldSymbol } from '../context'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

/**
 * ArrayItems — 数组项渲染组件（参考 Formily ArrayItems）
 *
 * 作为 array 字段的默认 component，注册到组件注册表中。
 * 当 schema 定义 `type: 'array'` 时，由 ReactiveField 解析并渲染此组件。
 *
 * 内部使用 ArrayBase 提供操作上下文，使用 RecursionField 递归渲染每个数组项。
 *
 * 渲染结构：
 * ```
 * ArrayBase
 *   ├─ 标题行（字段名 + 数量统计）
 *   ├─ ArrayBase.Item[0]
 *   │    ├─ ArrayBase.Index
 *   │    ├─ RecursionField(schema=items, name=0, basePath=fieldPath)
 *   │    ├─ ArrayBase.MoveUp
 *   │    ├─ ArrayBase.MoveDown
 *   │    └─ ArrayBase.Remove
 *   ├─ ArrayBase.Item[1]
 *   │    └─ ...
 *   └─ ArrayBase.Addition
 * ```
 *
 * @example schema 用法
 * ```ts
 * const schema: ISchema = {
 *   type: 'object',
 *   properties: {
 *     contacts: {
 *       type: 'array',
 *       title: '联系人',
 *       component: 'ArrayItems',  // 或省略，默认即 ArrayItems
 *       minItems: 1,
 *       maxItems: 10,
 *       items: {
 *         type: 'object',
 *         properties: {
 *           name: { type: 'string', title: '姓名' },
 *           phone: { type: 'string', title: '电话' },
 *         },
 *       },
 *     },
 *   },
 * }
 * ```
 */
export const ArrayItems = defineComponent({
  name: 'ArrayItems',
  props: {
    /** 数组项的 schema 定义（由 SchemaField/ReactiveField 传入） */
    itemsSchema: {
      type: Object as PropType<ISchema>,
      default: undefined,
    },
  },
  setup(props) {
    const field = inject(FieldSymbol, null) as ArrayFieldInstance | null

    return () => {
      if (!field) {
        console.warn('[ArrayItems] 未找到 ArrayField 上下文')
        return null
      }

      const arrayValue = Array.isArray(field.value) ? field.value : []

      const isEditable = field.editable
      const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

      /* 渲染每个数组项 */
      const items: VNode[] = arrayValue.map((_, index) => {
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
            /* 序号 */
            h(ArrayBase.Index),
            /* 内容区域：使用 RecursionField 递归渲染 */
            h('div', { style: { flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' } },
              props.itemsSchema
                ? [h(RecursionField, {
                    schema: props.itemsSchema,
                    name: index,
                    basePath: field.path,
                  })]
                : [h('span', { style: { color: '#999' } }, `Item ${index}`)],
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
          /* 标题 + 数量 */
          h('div', {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            },
          }, [
            h('span', { style: { fontWeight: 600, color: '#303133' } },
              field.label || field.path),
            h('span', { style: { color: '#909399', fontSize: '13px' } },
              `${arrayValue.length} / ${maxItems}`),
          ]),
          /* 数组项列表 */
          ...items,
          /* 添加按钮（虚线全宽，视觉上与上方项目卡片同组） */
          isEditable && h(ArrayBase.Addition),
        ]),
      })
    }
  },
})
