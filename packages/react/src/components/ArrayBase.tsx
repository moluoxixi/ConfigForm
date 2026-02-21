import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import { useField } from '../hooks'

interface ArrayBaseContextValue {
  field: ArrayFieldInstance
}

interface ArrayBaseItemContextValue {
  index: number
}

const ArrayBaseContext = createContext<ArrayBaseContextValue | null>(null)
const ArrayBaseItemContext = createContext<ArrayBaseItemContextValue | null>(null)

/**
 * use Array：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 use Array 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function useArray(): ArrayBaseContextValue | null {
  return useContext(ArrayBaseContext)
}

/**
 * use Index：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 use Index 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function useIndex(defaultIndex = 0): number {
  const ctx = useContext(ArrayBaseItemContext)
  return ctx?.index ?? defaultIndex
}

/**
 * use Editable：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 use Editable 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function useEditable(): { isEditable: boolean, field: ArrayFieldInstance | null } {
  const ctx = useArray()
  if (!ctx)
    return { isEditable: false, field: null }
  return { isEditable: ctx.field.editable, field: ctx.field }
}

/**
 * Array Base：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Array Base 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function ArrayBase({ children }: { children: ReactNode }): React.ReactElement | null {
  let field: ArrayFieldInstance | null = null
  try {
    field = useField() as unknown as ArrayFieldInstance
  }
  catch {
    return null
  }

  return (
    <ArrayBaseContext.Provider value={{ field }}>
      {children}
    </ArrayBaseContext.Provider>
  )
}

/**
 * Array Base Item：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Array Base Item 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function ArrayBaseItem({ index, children }: { index: number, children: ReactNode }): React.ReactElement {
  return (
    <ArrayBaseItemContext.Provider value={{ index }}>
      {children}
    </ArrayBaseItemContext.Provider>
  )
}

/**
 * Array Base Index：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Array Base Index 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function ArrayBaseIndex(): React.ReactElement {
  const index = useIndex()
  return (
    <span style={{ color: '#999', minWidth: 30, flexShrink: 0 }}>
      #
      {index + 1}
    </span>
  )
}

/**
 * Array Base Addition：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Array Base Addition 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function ArrayBaseAddition({ title = '+ 添加条目' }: { title?: string }): React.ReactElement | null {
  const { isEditable, field } = useEditable()
  if (!isEditable || !field)
    return null

  return (
    <button
      type="button"
      disabled={!field.canAdd}
      style={{
        width: '100%',
        padding: '8px 0',
        background: field.canAdd ? '#fff' : '#f5f5f5',
        color: field.canAdd ? '#1677ff' : '#999',
        border: `1px dashed ${field.canAdd ? '#1677ff' : '#d9d9d9'}`,
        borderRadius: 4,
        cursor: field.canAdd ? 'pointer' : 'not-allowed',
        fontSize: 14,
        lineHeight: '22px',
        transition: 'all 0.2s',
      }}
      onClick={() => field.push()}
      onMouseEnter={(e) => {
        if (field.canAdd) {
          e.currentTarget.style.background = '#e6f4ff'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = field.canAdd ? '#fff' : '#f5f5f5'
      }}
    >
      {title}
    </button>
  )
}

/**
 * Array Base Remove：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Array Base Remove 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function ArrayBaseRemove({ title = '删除' }: { title?: string }): React.ReactElement | null {
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field)
    return null

  return (
    <button
      type="button"
      disabled={!field.canRemove}
      style={opBtnStyle(!field.canRemove, '#ff4d4f')}
      onClick={(e) => {
        e.stopPropagation()
        field.remove(index)
      }}
    >
      {title}
    </button>
  )
}

/**
 * Array Base Move Up：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Array Base Move Up 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function ArrayBaseMoveUp({ title = '↑' }: { title?: string }): React.ReactElement | null {
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field)
    return null

  const disabled = index === 0
  return (
    <button
      type="button"
      disabled={disabled}
      style={opBtnStyle(disabled)}
      onClick={(e) => {
        e.stopPropagation()
        field.moveUp(index)
      }}
    >
      {title}
    </button>
  )
}

/**
 * Array Base Move Down：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Array Base Move Down 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function ArrayBaseMoveDown({ title = '↓' }: { title?: string }): React.ReactElement | null {
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field)
    return null

  const arr = Array.isArray(field.value) ? field.value : []
  const disabled = index >= arr.length - 1
  return (
    <button
      type="button"
      disabled={disabled}
      style={opBtnStyle(disabled)}
      onClick={(e) => {
        e.stopPropagation()
        field.moveDown(index)
      }}
    >
      {title}
    </button>
  )
}

/**
 * op Btn Style：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 op Btn Style 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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

ArrayBase.Item = ArrayBaseItem
ArrayBase.Index = ArrayBaseIndex
ArrayBase.Addition = ArrayBaseAddition
ArrayBase.Remove = ArrayBaseRemove
ArrayBase.MoveUp = ArrayBaseMoveUp
ArrayBase.MoveDown = ArrayBaseMoveDown
ArrayBase.useArray = useArray
ArrayBase.useIndex = useIndex
