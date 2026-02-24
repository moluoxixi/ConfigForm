import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import { useField } from '../hooks'

/**
 * useEditable：执行当前功能逻辑。
 *
 * @returns 返回当前功能的处理结果。
 */
function useEditable(): { isEditable: boolean, field: ArrayFieldInstance | null } {
  const ctx = useArray()
  if (!ctx)
    return { isEditable: false, field: null }
  return { isEditable: ctx.field.editable, field: ctx.field }
}

/**
 * Array Base：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/ArrayBase.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ children }）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * Array Base Item：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/ArrayBase.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ index, children }）用于提供位置序号，支撑排序或插入等序列操作。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
function ArrayBaseItem({ index, children }: { index: number, children: ReactNode }): React.ReactElement {
  return (
    <ArrayBaseItemContext.Provider value={{ index }}>
      {children}
    </ArrayBaseItemContext.Provider>
  )
}

/**
 * Array Base Index：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/ArrayBase.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * Array Base Addition：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/ArrayBase.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ title = '+ 添加条目' }）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * Array Base Remove：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/ArrayBase.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ title = '删除' }）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * Array Base Move Up：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/ArrayBase.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ title = '↑' }）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * Array Base Move Down：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/ArrayBase.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ title = '↓' }）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * op Btn Style：当前功能模块的核心执行单元。
 * 所属模块：`packages/react/src/components/ArrayBase.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param disabled 参数 `disabled`用于提供当前函数执行所需的输入信息。
 * @param [activeColor] 参数 `activeColor`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
