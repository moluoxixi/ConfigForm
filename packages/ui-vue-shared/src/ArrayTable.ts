import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import type { PropType, VNode } from 'vue'
import { RecursionField, useField } from '@moluoxixi/vue'
import { defineComponent, h } from 'vue'
import { ArrayBase } from './ArrayBase'

interface ColumnDef {
  key: string
  title: string
  schema: ISchema
}

function extractColumns(itemsSchema?: ISchema): ColumnDef[] {
  if (!itemsSchema?.properties)
    return []

  const entries = Object.entries(itemsSchema.properties)
  entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))

  return entries.map(([key, schema]) => ({
    key,
    title: schema.title ?? key,
    schema,
  }))
}

export const ArrayTable = defineComponent({
  name: 'ArrayTable',
  props: {
    itemsSchema: {
      type: Object as PropType<ISchema>,
      default: undefined,
    },
  },
  setup(props) {
    let field: ArrayFieldInstance
    try {
      field = useField() as unknown as ArrayFieldInstance
    }
    catch {
      return () => null
    }

    return () => {
      const arrayValue = Array.isArray(field.value) ? field.value : []
      const columns = extractColumns(props.itemsSchema)
      const isEditable = field.editable
      const isPreview = field.isPreview
      const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

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
        headerCells.push(h('th', { style: { ...thStyle, width: '120px', textAlign: 'center' } }, '操作'))
      }

      const rows: VNode[] = arrayValue.map((_, index) =>
        h(ArrayBase.Item, { key: index, index }, {
          default: () => h('tr', { style: { background: index % 2 === 0 ? '#fff' : '#fafafa' } }, [
            h('td', { style: { ...tdStyle, textAlign: 'center', color: '#999' } }, `${index + 1}`),
            ...columns.map(col =>
              h('td', { key: col.key, style: tdStyle }, isPreview
                ? [h('span', { style: { color: '#303133' } }, `${(arrayValue[index] as Record<string, unknown>)?.[col.key] ?? '—'}`)]
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
                  })]),
            ),
            isEditable
              ? h('td', { style: { ...tdStyle, textAlign: 'center' } }, h('div', { style: { display: 'flex', gap: '4px', justifyContent: 'center' } }, [
                  h(ArrayBase.MoveUp),
                  h(ArrayBase.MoveDown),
                  h(ArrayBase.Remove),
                ]))
              : null,
          ]),
        }),
      )

      if (arrayValue.length === 0) {
        const colSpan = columns.length + (isEditable ? 2 : 1)
        rows.push(
          h('tr', { key: 'empty' }, h('td', { colspan: colSpan, style: { ...tdStyle, textAlign: 'center', color: '#999', padding: '24px 0' } }, '暂无数据')),
        )
      }

      return h(ArrayBase, null, {
        default: () => h('div', { style: { width: '100%' } }, [
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } }, [
            h('span', { style: { fontWeight: 600, color: '#303133' } }, field.label || field.path),
            h('span', { style: { color: '#909399', fontSize: '13px' } }, `${arrayValue.length} / ${maxItems}`),
          ]),
          h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' } }, [
            h('thead', null, h('tr', null, headerCells)),
            h('tbody', null, rows),
          ]),
          isEditable ? h('div', { style: { marginTop: '8px' } }, h(ArrayBase.Addition)) : null,
        ]),
      })
    }
  },
})
