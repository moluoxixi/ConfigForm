import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ISchema } from '@moluoxixi/core'
import type { PropType, VNode } from 'vue'
import { defineComponent, h, inject } from 'vue'
import { FieldSymbol } from '../context'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

/**
 * 列定义，从 items.properties 提取
 */
interface ColumnDef {
  /** 属性 key */
  key: string
  /** 列标题（取自 schema.title） */
  title: string
  /** 子字段 schema */
  schema: ISchema
}

/**
 * 从 items schema 的 properties 中提取列定义
 */
function extractColumns(itemsSchema?: ISchema): ColumnDef[] {
  if (!itemsSchema?.properties) return []

  const entries = Object.entries(itemsSchema.properties)
  entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))

  return entries.map(([key, schema]) => ({
    key,
    title: schema.title ?? key,
    schema,
  }))
}

/**
 * ArrayTable — 表格形式的数组渲染组件（Vue 版）
 *
 * 与 ArrayItems 的卡片式布局不同，ArrayTable 渲染为 HTML `<table>`：
 * - 表头从 items.properties 的 title 提取
 * - 每行对应一个数组项，每列对应一个子字段
 * - 行内编辑：每个单元格使用 RecursionField 渲染对应的表单组件
 * - 操作列：移动/删除按钮
 */
export const ArrayTable = defineComponent({
  name: 'ArrayTable',
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
        console.warn('[ArrayTable] 未找到 ArrayField 上下文')
        return null
      }

      const arrayValue = Array.isArray(field.value) ? field.value : []
      const columns = extractColumns(props.itemsSchema)

      const isEditable = field.editable
      const isReadOnly = field.effectiveReadOnly
      const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

      /** 样式常量 */
      const thStyle = {
        padding: '8px 12px',
        textAlign: 'left' as const,
        fontWeight: 600,
        color: '#606266',
        background: '#fafafa',
        borderBottom: '2px solid #ebeef5',
        whiteSpace: 'nowrap' as const,
      }

      const tdStyle = {
        padding: '6px 8px',
        borderBottom: '1px solid #ebeef5',
        verticalAlign: 'top' as const,
      }

      /** 构建表头 */
      const headerCells: VNode[] = [
        h('th', { style: { ...thStyle, width: '50px', textAlign: 'center' } }, '#'),
        ...columns.map(col =>
          h('th', { key: col.key, style: thStyle }, [
            col.schema.required ? h('span', { style: { color: '#ff4d4f', marginRight: '4px' } }, '*') : null,
            col.title,
          ]),
        ),
      ]
      if (isEditable) {
        headerCells.push(
          h('th', { style: { ...thStyle, width: '120px', textAlign: 'center' } }, '操作'),
        )
      }

      /** 构建行 */
      const rows: VNode[] = arrayValue.map((_, index) =>
        h(ArrayBase.Item, { key: index, index }, {
          default: () => h('tr', {
            style: { background: index % 2 === 0 ? '#fff' : '#fafafa' },
          }, [
            /* 序号 */
            h('td', { style: { ...tdStyle, textAlign: 'center', color: '#999' } }, `${index + 1}`),
            /* 数据列 */
            ...columns.map(col =>
              h('td', { key: col.key, style: tdStyle },
                isReadOnly
                  ? [h('span', { style: { color: '#303133' } },
                      `${(arrayValue[index] as Record<string, unknown>)?.[col.key] ?? '—'}`)]
                  : [h(RecursionField, {
                      schema: {
                        type: 'object',
                        properties: {
                          [col.key]: {
                            ...col.schema,
                            title: undefined,
                            decorator: '',
                          },
                        },
                      },
                      name: index,
                      basePath: field.path,
                      onlyRenderProperties: true,
                    })],
              ),
            ),
            /* 操作列 */
            isEditable
              ? h('td', { style: { ...tdStyle, textAlign: 'center' } },
                  h('div', { style: { display: 'flex', gap: '4px', justifyContent: 'center' } }, [
                    h(ArrayBase.MoveUp),
                    h(ArrayBase.MoveDown),
                    h(ArrayBase.Remove),
                  ]),
                )
              : null,
          ]),
        }),
      )

      /* 空状态行 */
      if (arrayValue.length === 0) {
        const colSpan = columns.length + (isEditable ? 2 : 1)
        rows.push(
          h('tr', { key: 'empty' },
            h('td', { colspan: colSpan, style: { ...tdStyle, textAlign: 'center', color: '#999', padding: '24px 0' } }, '暂无数据'),
          ),
        )
      }

      return h(ArrayBase, null, {
        default: () => h('div', { style: { width: '100%' } }, [
          /* 标题 + 数量 */
          h('div', {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
          }, [
            h('span', { style: { fontWeight: 600, color: '#303133' } }, field.label || field.path),
            h('span', { style: { color: '#909399', fontSize: '13px' } }, `${arrayValue.length} / ${maxItems}`),
          ]),
          /* 表格 */
          h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' } }, [
            h('thead', null, h('tr', null, headerCells)),
            h('tbody', null, rows),
          ]),
          /* 添加按钮 */
          isEditable ? h('div', { style: { marginTop: '8px' } }, h(ArrayBase.Addition)) : null,
        ]),
      })
    }
  },
})
