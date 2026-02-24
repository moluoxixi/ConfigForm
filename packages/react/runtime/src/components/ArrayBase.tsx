import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import { useField } from '../hooks'

/**
 * 数组上下文值。
 * 保存当前 `ArrayBase` 对应的数组字段实例，供增删改排序按钮读取。
 */
interface ArrayBaseContextValue {
  field: ArrayFieldInstance
}

/**
 * 数组项上下文值。
 * 保存当前数组项索引，供 `MoveUp/MoveDown/Remove` 等操作使用。
 */
interface ArrayBaseItemContextValue {
  index: number
}

/**
 * `ArrayBase` 根组件属性。
 */
interface ArrayBaseProps {
  children: ReactNode
}

/**
 * `ArrayBase.Item` 组件属性。
 */
interface ArrayBaseItemProps {
  index: number
  children: ReactNode
}

/**
 * 数组操作按钮组件通用属性。
 */
interface ArrayActionButtonProps {
  title?: string
}

/**
 * 组合组件类型声明。
 * 暴露与 Formily 接近的 API，方便业务侧直接使用 `ArrayBase.Xxx`。
 */
interface ArrayBaseCompound {
  (props: ArrayBaseProps): React.ReactElement | null
  Item: (props: ArrayBaseItemProps) => React.ReactElement
  Index: () => React.ReactElement
  Addition: (props: ArrayActionButtonProps) => React.ReactElement | null
  Remove: (props: ArrayActionButtonProps) => React.ReactElement | null
  MoveUp: (props: ArrayActionButtonProps) => React.ReactElement | null
  MoveDown: (props: ArrayActionButtonProps) => React.ReactElement | null
  useArray: () => ArrayBaseContextValue | null
  useIndex: (defaultIndex?: number) => number
}

/**
 * 数组字段上下文。
 * 仅在 `ArrayBase` 根组件中注入，子组件通过 `useArray` 读取。
 */
const ArrayBaseContext = createContext<ArrayBaseContextValue | null>(null)

/**
 * 数组项索引上下文。
 * 仅在 `ArrayBase.Item` 中注入，子组件通过 `useIndex` 读取。
 */
const ArrayBaseItemContext = createContext<ArrayBaseItemContextValue | null>(null)

/**
 * 读取数组字段上下文。
 * @returns 返回当前数组上下文；若不在 ArrayBase 内部则返回 `null`。
 */
export function useArray(): ArrayBaseContextValue | null {
  return useContext(ArrayBaseContext)
}

/**
 * 读取当前数组项索引。
 * @param defaultIndex 当不在 `ArrayBase.Item` 内部时返回的兜底索引。
 * @returns 返回当前数组项索引。
 */
export function useIndex(defaultIndex = 0): number {
  const ctx = useContext(ArrayBaseItemContext)
  return ctx?.index ?? defaultIndex
}

/**
 * 统一计算数组是否可编辑。
 * 仅当拿到数组字段实例且字段处于 editable 模式时返回可编辑。
 *
 * @returns 返回编辑态信息与数组字段实例。
 */
function useEditable(): { isEditable: boolean, field: ArrayFieldInstance | null } {
  const ctx = useArray()
  if (!ctx) {
    return { isEditable: false, field: null }
  }
  return { isEditable: ctx.field.editable, field: ctx.field }
}

/**
 * ArrayBase 根容器。
 * 负责把当前数组字段实例注入上下文，供子组件共享访问。
 *
 * @param props 根组件属性对象。
 * @param props.children 数组区域内容节点。
 * @returns 返回数组上下文容器；若当前上下文没有数组字段则返回 `null`。
 */
function ArrayBaseRoot(props: ArrayBaseProps): React.ReactElement | null {
  const { children } = props
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
 * 数组项容器。
 * 为当前数组项注入索引上下文，供项内操作按钮复用。
 *
 * @param props 数组项属性对象。
 * @param props.index 当前项索引。
 * @param props.children 当前项内容节点。
 * @returns 返回数组项索引上下文容器。
 */
function ArrayBaseItem(props: ArrayBaseItemProps): React.ReactElement {
  const { index, children } = props
  return (
    <ArrayBaseItemContext.Provider value={{ index }}>
      {children}
    </ArrayBaseItemContext.Provider>
  )
}

/**
 * 数组项序号展示组件。
 * @returns 返回序号文本节点，格式为 `#1`、`#2`。
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
 * 添加按钮组件。
 *
 * @param props 操作按钮属性对象。
 * @param props.title 按钮文案，默认 `+ 添加条目`。
 * @returns 可编辑时返回按钮，否则返回 `null`。
 */
function ArrayBaseAddition(props: ArrayActionButtonProps): React.ReactElement | null {
  const { title = '+ 添加条目' } = props
  const { isEditable, field } = useEditable()
  if (!isEditable || !field) {
    return null
  }

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
      onMouseEnter={(event) => {
        if (field.canAdd) {
          event.currentTarget.style.background = '#e6f4ff'
        }
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = field.canAdd ? '#fff' : '#f5f5f5'
      }}
    >
      {title}
    </button>
  )
}

/**
 * 删除按钮组件。
 *
 * @param props 操作按钮属性对象。
 * @param props.title 按钮文案，默认 `删除`。
 * @returns 可编辑时返回按钮，否则返回 `null`。
 */
function ArrayBaseRemove(props: ArrayActionButtonProps): React.ReactElement | null {
  const { title = '删除' } = props
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field) {
    return null
  }

  return (
    <button
      type="button"
      disabled={!field.canRemove}
      style={opBtnStyle(!field.canRemove, '#ff4d4f')}
      onClick={(event) => {
        event.stopPropagation()
        field.remove(index)
      }}
    >
      {title}
    </button>
  )
}

/**
 * 上移按钮组件。
 *
 * @param props 操作按钮属性对象。
 * @param props.title 按钮文案，默认 `↑`。
 * @returns 可编辑时返回按钮，否则返回 `null`。
 */
function ArrayBaseMoveUp(props: ArrayActionButtonProps): React.ReactElement | null {
  const { title = '↑' } = props
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field) {
    return null
  }

  const disabled = index === 0
  return (
    <button
      type="button"
      disabled={disabled}
      style={opBtnStyle(disabled)}
      onClick={(event) => {
        event.stopPropagation()
        field.moveUp(index)
      }}
    >
      {title}
    </button>
  )
}

/**
 * 下移按钮组件。
 *
 * @param props 操作按钮属性对象。
 * @param props.title 按钮文案，默认 `↓`。
 * @returns 可编辑时返回按钮，否则返回 `null`。
 */
function ArrayBaseMoveDown(props: ArrayActionButtonProps): React.ReactElement | null {
  const { title = '↓' } = props
  const { isEditable, field } = useEditable()
  const index = useIndex()
  if (!isEditable || !field) {
    return null
  }

  const values = Array.isArray(field.value) ? field.value : []
  const disabled = index >= values.length - 1
  return (
    <button
      type="button"
      disabled={disabled}
      style={opBtnStyle(disabled)}
      onClick={(event) => {
        event.stopPropagation()
        field.moveDown(index)
      }}
    >
      {title}
    </button>
  )
}

/**
 * 构造数组操作按钮通用样式。
 *
 * @param disabled 按钮是否禁用。
 * @param activeColor 按钮可用时的主色。
 * @returns 返回按钮样式对象。
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

/**
 * 组合导出，保持 `ArrayBase.Xxx` 用法与历史版本兼容。
 */
export const ArrayBase = ArrayBaseRoot as ArrayBaseCompound
ArrayBase.Item = ArrayBaseItem
ArrayBase.Index = ArrayBaseIndex
ArrayBase.Addition = ArrayBaseAddition
ArrayBase.Remove = ArrayBaseRemove
ArrayBase.MoveUp = ArrayBaseMoveUp
ArrayBase.MoveDown = ArrayBaseMoveDown
ArrayBase.useArray = useArray
ArrayBase.useIndex = useIndex
