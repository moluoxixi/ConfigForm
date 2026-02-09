import type { FieldInstance } from '@moluoxixi/core'
import type { ReactElement, ReactNode } from 'react'
import { observer } from '@moluoxixi/reactive-react'
import React, { useCallback, useContext, useState } from 'react'
import { FieldContext, FormContext } from '../context'

/* ======================== Editable ======================== */

export interface EditableProps {
  children: ReactNode
}

/**
 * Editable — 可编辑容器
 *
 * 阅读态点击切换为编辑态的内联编辑容器。
 * 包裹的字段默认以阅读态（readOnly）显示，
 * 点击后切换为编辑态（editable），失焦后切回阅读态。
 *
 * @example
 * ```tsx
 * <Editable>
 *   <FormField name="username" component="Input" />
 * </Editable>
 * ```
 */
export const Editable = observer(({ children }: EditableProps): ReactElement => {
  const field = useContext(FieldContext) as FieldInstance | null
  const form = useContext(FormContext)
  const [editing, setEditing] = useState(false)

  const formPattern = form?.pattern ?? 'editable'

  /** 非编辑模式下不可切换 */
  if (formPattern !== 'editable') {
    return <>{children}</>
  }

  const handleClick = useCallback((): void => {
    if (!editing && field) {
      field.pattern = 'editable'
      setEditing(true)
    }
  }, [editing, field])

  const handleBlur = useCallback((): void => {
    if (editing && field) {
      field.pattern = 'readOnly'
      setEditing(false)
    }
  }, [editing, field])

  /** 初始设置为阅读态 */
  if (field && !editing && field.pattern === 'editable') {
    field.pattern = 'readOnly'
  }

  return (
    <div
      onClick={handleClick}
      onBlur={handleBlur}
      style={{
        cursor: editing ? 'default' : 'pointer',
        minHeight: 32,
        padding: editing ? 0 : '4px 8px',
        borderRadius: 4,
        border: editing ? 'none' : '1px dashed transparent',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!editing) {
          e.currentTarget.style.borderColor = '#d9d9d9'
          e.currentTarget.style.background = '#fafafa'
        }
      }}
      onMouseLeave={(e) => {
        if (!editing) {
          e.currentTarget.style.borderColor = 'transparent'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {children}
    </div>
  )
})

/* ======================== EditablePopover ======================== */

export interface EditablePopoverProps {
  children: ReactNode
  /** 弹出层标题 */
  title?: string
}

/**
 * EditablePopover — Popover 内编辑
 *
 * 点击字段后在 Popover 弹出层中编辑，
 * 关闭弹出层后恢复阅读态。
 */
export const EditablePopover = observer(({ children, title }: EditablePopoverProps): ReactElement => {
  const field = useContext(FieldContext) as FieldInstance | null
  const form = useContext(FormContext)
  const [visible, setVisible] = useState(false)

  const formPattern = form?.pattern ?? 'editable'

  if (formPattern !== 'editable') {
    return <>{children}</>
  }

  const handleOpen = useCallback((): void => {
    if (field) {
      field.pattern = 'editable'
      setVisible(true)
    }
  }, [field])

  const handleClose = useCallback((): void => {
    if (field) {
      field.pattern = 'readOnly'
      setVisible(false)
    }
  }, [field])

  /** 初始设置为阅读态 */
  if (field && !visible && field.pattern === 'editable') {
    field.pattern = 'readOnly'
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={handleOpen}
        style={{
          cursor: 'pointer',
          minHeight: 32,
          padding: '4px 8px',
          borderRadius: 4,
          border: '1px dashed transparent',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#d9d9d9'
          e.currentTarget.style.background = '#fafafa'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'transparent'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        {children}
      </div>

      {/* 简易 Popover（无 antd 依赖） */}
      {visible && (
        <>
          {/* 遮罩层 */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={handleClose}
          />
          {/* 弹出面板 */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1000,
            minWidth: 280,
            padding: 16,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
            border: '1px solid #e8e8e8',
            marginTop: 4,
          }}>
            {title && (
              <div style={{ fontWeight: 600, marginBottom: 12, color: '#333', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                {title}
              </div>
            )}
            {children}
          </div>
        </>
      )}
    </div>
  )
})
