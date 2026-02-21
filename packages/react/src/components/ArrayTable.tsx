import type { ArrayFieldInstance, ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import React from 'react'

import { useField } from '../hooks'
import { observer } from '../reactive'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

export interface ArrayTableProps {
  itemsSchema?: ISchema
}

interface ColumnDef {
  key: string
  title: string
  schema: ISchema
}

/**
 * to Preview Text：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 to Preview Text 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function toPreviewText(value: unknown): string {
  if (value === null || value === undefined || value === '')
    return '—'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    }
    catch {
      return '[Object]'
    }
  }
  return String(value)
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

export const ArrayTable = observer<ArrayTableProps>(({ itemsSchema }): ReactElement | null => {
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
              {columns.map(col => (
                <th key={col.key} style={thStyle}>
                  {col.schema.required && <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>}
                  {col.title}
                </th>
              ))}
              {isEditable && (
                <th style={{ ...thStyle, width: 120, textAlign: 'center' }}>操作</th>
              )}
            </tr>
          </thead>
          <tbody>
            {arrayValue.map((_, index) => (
              <ArrayBase.Item key={index} index={index}>
                <tr style={{ background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#999' }}>{index + 1}</td>

                  {columns.map(col => (
                    <td key={col.key} style={tdStyle}>
                      {isPreview
                        ? (
                            <span style={{ color: '#303133' }}>
                              {toPreviewText((arrayValue[index] as Record<string, unknown> | undefined)?.[col.key])}
                            </span>
                          )
                        : (
                            <RecursionField
                              schema={{
                                type: 'object',
                                properties: {
                                  [col.key]: {
                                    ...col.schema,
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

        {isEditable && <div style={{ marginTop: 8 }}><ArrayBase.Addition /></div>}
      </div>
    </ArrayBase>
  )
})
