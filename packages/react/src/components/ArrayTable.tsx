import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ISchema } from '@moluoxixi/core'
import { observer } from '@moluoxixi/reactive-react'
import React, { useContext } from 'react'
import { FieldContext, FormContext } from '../context'
import { ArrayBase } from './ArrayBase'
import { RecursionField } from './RecursionField'

export interface ArrayTableProps {
  /** 数组项的 schema 定义（由 SchemaField 通过 componentProps.itemsSchema 传入） */
  itemsSchema?: ISchema
}

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
 * ArrayTable — 表格形式的数组渲染组件（React 版）
 *
 * 与 ArrayItems 的卡片式布局不同，ArrayTable 渲染为 HTML `<table>`：
 * - 表头从 items.properties 的 title 提取
 * - 每行对应一个数组项，每列对应一个子字段
 * - 行内编辑：每个单元格使用 RecursionField 渲染对应的表单组件
 * - 操作列：移动/删除按钮
 *
 * 渲染结构：
 * ```
 * ArrayBase
 *   ├─ 标题行（字段名 + 数量统计）
 *   ├─ <table>
 *   │    ├─ <thead> (列标题 + 操作列)
 *   │    └─ <tbody>
 *   │         ├─ <tr> ArrayBase.Item[0]
 *   │         │    ├─ <td> FormField (col1) </td>
 *   │         │    ├─ <td> FormField (col2) </td>
 *   │         │    └─ <td> MoveUp / MoveDown / Remove </td>
 *   │         └─ ...
 *   └─ ArrayBase.Addition
 * ```
 */
export const ArrayTable = observer<ArrayTableProps>(({ itemsSchema }) => {
  const field = useContext(FieldContext) as ArrayFieldInstance | null
  const form = useContext(FormContext)

  if (!field) {
    console.warn('[ArrayTable] 未找到 ArrayField 上下文')
    return null
  }

  const arrayValue = Array.isArray(field.value) ? field.value : []
  const columns = extractColumns(itemsSchema)

  const fp = field.pattern || 'editable'
  const formP = form?.pattern ?? 'editable'
  const isEditable = fp === 'editable' && formP === 'editable'
  const isReadOnly = fp === 'readOnly' || formP === 'readOnly'
  const maxItems = field.maxItems === Infinity ? '∞' : field.maxItems

  /** 表格样式 */
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
        {/* 标题 + 数量 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#303133' }}>
            {field.label || field.path}
          </span>
          <span style={{ color: '#909399', fontSize: 13 }}>
            {arrayValue.length} / {maxItems}
          </span>
        </div>

        {/* 表格 */}
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
                  {/* 序号 */}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#999' }}>{index + 1}</td>

                  {/* 数据列：逐列渲染单个字段 */}
                  {columns.map(col => (
                    <td key={col.key} style={tdStyle}>
                      {isReadOnly
                        ? (
                            <span style={{ color: '#303133' }}>
                              {arrayValue[index]?.[col.key] ?? '—'}
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

                  {/* 操作列 */}
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

        {/* 添加按钮 */}
        {isEditable && <div style={{ marginTop: 8 }}><ArrayBase.Addition /></div>}
      </div>
    </ArrayBase>
  )
})
