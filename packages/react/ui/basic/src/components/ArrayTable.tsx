import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { observer, RecursionField, useField } from '@moluoxixi/react'
import React from 'react'
import { ArrayBase } from './ArrayBase'

/**
 * `ArrayTable` 组件属性。
 */
export interface ArrayTableProps {
  /** 数组项 schema，由 SchemaField 通过 `componentProps.itemsSchema` 透传。 */
  itemsSchema?: ISchema
}

/**
 * 表格列定义。
 */
interface ColumnDef {
  /** 字段键名。 */
  key: string
  /** 表头标题。 */
  title: string
  /** 列对应的子字段 schema。 */
  schema: ISchema
}

/**
 * 从数组项 schema 中提取列定义。
 * 按 `order` 从小到大排序，保持与 schema 渲染顺序一致。
 *
 * @param itemsSchema 数组项 schema。
 * @returns 返回可用于表头和单元格渲染的列定义列表。
 */
function extractColumns(itemsSchema?: ISchema): ColumnDef[] {
  if (!itemsSchema?.properties) {
    return []
  }

  const entries = Object.entries(itemsSchema.properties)
  entries.sort(([, left], [, right]) => (left.order ?? 0) - (right.order ?? 0))

  return entries.map(([key, schema]) => ({
    key,
    title: schema.title ?? key,
    schema,
  }))
}

/**
 * 把任意值转换成预览文本。
 *
 * @param value 待展示值。
 * @returns 返回可直接渲染到单元格的文本。
 */
function toPreviewText(value: unknown): string {
  if (value === undefined || value === null) {
    return '—'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

/**
 * 表格形态的数组字段渲染器。
 * 每一行对应一个数组项，每一列对应 `itemsSchema.properties` 中的一个字段。
 *
 * @param props 组件属性对象。
 * @param props.itemsSchema 数组项 schema。
 * @returns 返回数组表格节点；未获取到数组字段上下文时返回 `null`。
 */
export const ArrayTable = observer<ArrayTableProps>((props): ReactElement | null => {
  const { itemsSchema } = props
  let field: ArrayFieldInstance | null = null

  try {
    field = useField() as unknown as ArrayFieldInstance
  }
  catch {
    return null
  }

  const arrayValue = Array.isArray(field.value) ? field.value : []
  const columns = extractColumns(itemsSchema)
  const isEditable = field.editable
  const isPreview = field.isPreview
  const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  }

  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#606266',
    background: '#fafafa',
    borderBottom: '2px solid #ebeef5',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '6px 8px',
    borderBottom: '1px solid #ebeef5',
    verticalAlign: 'top',
  }

  return (
    <ArrayBase>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#303133' }}>
            {field.label || field.path}
          </span>
          <span style={{ color: '#909399', fontSize: 13 }}>
            {arrayValue.length}
            {' '}
            /
            {maxItems}
          </span>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 50, textAlign: 'center' }}>#</th>
              {columns.map(column => (
                <th key={column.key} style={thStyle}>
                  {column.schema.required && <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>}
                  {column.title}
                </th>
              ))}
              {isEditable && <th style={{ ...thStyle, width: 120, textAlign: 'center' }}>操作</th>}
            </tr>
          </thead>
          <tbody>
            {arrayValue.map((_, index) => (
              <ArrayBase.Item key={index} index={index}>
                <tr style={{ background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#999' }}>{index + 1}</td>
                  {columns.map(column => (
                    <td key={column.key} style={tdStyle}>
                      {isPreview
                        ? (
                            <span style={{ color: '#303133' }}>
                              {toPreviewText((arrayValue[index] as Record<string, unknown> | undefined)?.[column.key])}
                            </span>
                          )
                        : (
                            <RecursionField
                              schema={{
                                type: 'object',
                                properties: {
                                  [column.key]: {
                                    ...column.schema,
                                    title: undefined,
                                    decorator: '',
                                  },
                                },
                              }}
                              name={index}
                              basePath={field.path}
                              onlyRenderProperties
                            />
                          )}
                    </td>
                  ))}
                  {isEditable && (
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <ArrayBase.MoveUp />
                        <ArrayBase.MoveDown />
                        <ArrayBase.Remove />
                      </div>
                    </td>
                  )}
                </tr>
              </ArrayBase.Item>
            ))}
            {arrayValue.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (isEditable ? 2 : 1)}
                  style={{ ...tdStyle, textAlign: 'center', color: '#999', padding: '24px 0' }}
                >
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {isEditable && (
          <div style={{ marginTop: 8 }}>
            <ArrayBase.Addition />
          </div>
        )}
      </div>
    </ArrayBase>
  )
})
