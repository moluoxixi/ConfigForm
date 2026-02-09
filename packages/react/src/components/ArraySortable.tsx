import type { ArrayFieldInstance } from '@moluoxixi/core'
import type { ReactElement, ReactNode } from 'react'
import React, { useCallback, useContext, useRef, useState } from 'react'
import { FieldContext } from '../context'

export interface ArraySortableProps {
  children: ReactNode
}

export interface SortableItemProps {
  /** 数组项索引 */
  index: number
  children: ReactNode
}

/**
 * ArraySortable — 拖拽排序容器
 *
 * 使用原生 HTML5 Drag and Drop API 实现数组项的拖拽排序。
 * 拖拽完成后调用 `field.move(from, to)` 更新数据。
 *
 * 无外部依赖，轻量可靠。
 *
 * @example
 * ```tsx
 * <ArraySortable>
 *   {items.map((_, index) => (
 *     <ArraySortable.Item key={index} index={index}>
 *       <div>Item {index}</div>
 *     </ArraySortable.Item>
 *   ))}
 * </ArraySortable>
 * ```
 */
export function ArraySortable({ children }: ArraySortableProps): ReactElement {
  const field = useContext(FieldContext) as ArrayFieldInstance | null
  const dragIndexRef = useRef<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((index: number): void => {
    dragIndexRef.current = index
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number): void => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }, [])

  const handleDrop = useCallback((index: number): void => {
    const fromIndex = dragIndexRef.current
    if (fromIndex !== null && fromIndex !== index && field) {
      field.move(fromIndex, index)
    }
    dragIndexRef.current = null
    setDropIndex(null)
  }, [field])

  const handleDragEnd = useCallback((): void => {
    dragIndexRef.current = null
    setDropIndex(null)
  }, [])

  return (
    <SortableContext.Provider value={{ handleDragStart, handleDragOver, handleDrop, handleDragEnd, dropIndex }}>
      {children}
    </SortableContext.Provider>
  )
}

/* ======================== Context ======================== */

interface ISortableContext {
  handleDragStart: (index: number) => void
  handleDragOver: (e: React.DragEvent, index: number) => void
  handleDrop: (index: number) => void
  handleDragEnd: () => void
  dropIndex: number | null
}

const SortableContext = React.createContext<ISortableContext | null>(null)

/* ======================== SortableItem ======================== */

/**
 * 可排序项 — 为子元素添加拖拽能力
 */
function SortableItem({ index, children }: SortableItemProps): ReactElement {
  const ctx = useContext(SortableContext)

  if (!ctx) {
    return <>{children}</>
  }

  const isDropTarget = ctx.dropIndex === index

  return (
    <div
      draggable
      onDragStart={() => ctx.handleDragStart(index)}
      onDragOver={(e) => ctx.handleDragOver(e, index)}
      onDrop={() => ctx.handleDrop(index)}
      onDragEnd={ctx.handleDragEnd}
      style={{
        cursor: 'grab',
        outline: isDropTarget ? '2px dashed #1677ff' : 'none',
        outlineOffset: -2,
        transition: 'outline 0.15s',
      }}
    >
      {children}
    </div>
  )
}

ArraySortable.Item = SortableItem
