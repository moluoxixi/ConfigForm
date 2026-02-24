import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import type { PropType, VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { useField } from '../composables'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

/**
 * ColumnDef??????
 * ???`packages/vue/src/components/ArrayTable.ts:8`?
 * ??????????????????????????????
 */
interface ColumnDef {
  key: string
  title: string
  schema: ISchema
}

/**
 * extract Columns：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 extract Columns 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/vue/src/components/ArrayTable.ts:43`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
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
          /**
           * default：执行当前位置的功能逻辑。
           * 定位：`packages/vue/src/components/ArrayTable.ts:90`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @returns 返回当前分支执行后的处理结果。
           */
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
        /**
         * default：执行当前位置的功能逻辑。
         * 定位：`packages/vue/src/components/ArrayTable.ts:130`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
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
