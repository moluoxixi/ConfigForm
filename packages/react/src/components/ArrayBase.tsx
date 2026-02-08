import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import { FieldContext, FormContext } from '../context'

/* ======================== Context ======================== */

interface IArrayBaseContext {
  field: ArrayFieldInstance
}

interface IArrayBaseItemContext {
  index: number
}

const ArrayBaseContext = createContext<IArrayBaseContext | null>(null)
const ArrayBaseItemContext = createContext<IArrayBaseItemContext | null>(null)

/* ======================== Hooks ======================== */

/** 获取 ArrayBase 上下文 */
export function useArray(): IArrayBaseContext | null {
  return useContext(ArrayBaseContext)
}

/** 获取当前数组项索引 */
export function useIndex(defaultIndex = 0): number {
  const ctx = useContext(ArrayBaseItemContext)
  return ctx?.index ?? defaultIndex
}

/* ======================== 工具：判断是否可编辑 ======================== */

function useEditable(): { isEditable: boolean, field: ArrayFieldInstance | null } {
  const ctx = useArray()
  const form = useContext(FormContext)

  if (!ctx) return { isEditable: false, field: null }

  const field = ctx.field
  const pattern = field.pattern || form?.pattern || 'editable'
  return { isEditable: pattern === 'editable', field }
}

/* ======================== 组件 ======================== */

/** ArrayBase — 数组基础容器（参考 Formily） */
export function ArrayBase({ children }: { children: ReactNode }): React.ReactElement | null {
  const field = useContext(FieldContext) as ArrayFieldInstance | null
  if (!field) return null

  return (
    <ArrayBaseContext.Provider value={{ field }}>
      {children}
    </ArrayBaseContext.Provider>
  )
}

/** ArrayBase.Item — 数组项容器 */
function ArrayBaseItem({ index, children }: { index: number, children: ReactNode }): React.ReactElement {
  return (
    <ArrayBaseItemContext.Provider value={{ index }}>
      {children}
    </ArrayBaseItemContext.Provider>
  )
}

/** ArrayBase.Index — 显示序号 */
function ArrayBaseIndex(): React.ReactElement {
  const index = useIndex()
  return <span style={{ color: '#999', minWidth: 30, flexShrink: 0 }}>#{index + 1}</span>
}

/** ArrayBase.Addition — 添加按钮 */
function ArrayBaseAddition({ title = '+ 添加' }: { title?: string }): React.ReactElement | null {
  const { isEditable, field } = useEditable()
  if (!isEditable || !field) return null

  return (
    <button
      type="button"
      disabled={!field.canAdd}
      style={{
        padding: '6px 16px',
        background: field.canAdd ? '#1677ff' : '#eee',
        color: field.canAdd ? '#fff' : '#999',
        border: 'none',
        borderRadius: 6,
        cursor: field.canAdd ? 'pointer' : 'not-allowed',
        fontSize: 13,
      }}
      onClick={() => field.push()}
    >
      {title}
    </button>
  )
}

/** ArrayBase.Remove — 删除按钮 */
function ArrayBaseRemove({ title = '删除' }: { title?: string }): React.ReactElement | null {
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field) return null

  return (
    <button
      type="button"
      disabled={!field.canRemove}
      style={opBtnStyle(!field.canRemove, '#ff4d4f')}
      onClick={(e) => { e.stopPropagation(); field.remove(index) }}
    >
      {title}
    </button>
  )
}

/** ArrayBase.MoveUp — 上移按钮 */
function ArrayBaseMoveUp({ title = '↑' }: { title?: string }): React.ReactElement | null {
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field) return null

  const disabled = index === 0
  return (
    <button
      type="button"
      disabled={disabled}
      style={opBtnStyle(disabled)}
      onClick={(e) => { e.stopPropagation(); field.moveUp(index) }}
    >
      {title}
    </button>
  )
}

/** ArrayBase.MoveDown — 下移按钮 */
function ArrayBaseMoveDown({ title = '↓' }: { title?: string }): React.ReactElement | null {
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field) return null

  const arr = Array.isArray(field.value) ? field.value : []
  const disabled = index >= arr.length - 1
  return (
    <button
      type="button"
      disabled={disabled}
      style={opBtnStyle(disabled)}
      onClick={(e) => { e.stopPropagation(); field.moveDown(index) }}
    >
      {title}
    </button>
  )
}

/* ======================== 样式 ======================== */

function opBtnStyle(disabled: boolean, activeColor = '#606266'): React.CSSProperties {
  return {
    padding: '4px 8px',
    background: disabled ? '#f5f5f5' : '#fff',
    color: disabled ? '#ccc' : activeColor,
    border: `1px solid ${disabled ? '#d9d9d9' : activeColor === '#606266' ? '#d9d9d9' : activeColor}`,
    borderRadius: 4,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 12,
    lineHeight: 1,
  }
}

/* ======================== 组合导出 ======================== */

ArrayBase.Item = ArrayBaseItem
ArrayBase.Index = ArrayBaseIndex
ArrayBase.Addition = ArrayBaseAddition
ArrayBase.Remove = ArrayBaseRemove
ArrayBase.MoveUp = ArrayBaseMoveUp
ArrayBase.MoveDown = ArrayBaseMoveDown
ArrayBase.useArray = useArray
ArrayBase.useIndex = useIndex
