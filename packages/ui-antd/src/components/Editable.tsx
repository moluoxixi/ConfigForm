import type { FieldInstance } from '@moluoxixi/core'
import type { ReactElement, ReactNode } from 'react'
import { observer, useField, useForm } from '@moluoxixi/react'
import { Popover } from 'antd'
import { useCallback, useState } from 'react'

/**
 * Editable Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/Editable.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface EditableProps {
  children: ReactNode
}

/**
 * Editable：定义该模块复用的常量配置。
 * 所属模块：`packages/ui-antd/src/components/Editable.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const Editable = observer(({ children }: EditableProps): ReactElement => {
  let field: FieldInstance | null = null
  let formPattern: string = 'editable'
  try {
    field = useField()
    formPattern = useForm().pattern
  }
  catch {
    return <>{children}</>
  }

  const [editing, setEditing] = useState(false)

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
      field.pattern = 'preview'
      setEditing(false)
    }
  }, [editing, field])

  if (field && !editing && field.pattern === 'editable') {
    field.pattern = 'preview'
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

/**
 * Editable Popover Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/Editable.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface EditablePopoverProps {
  children: ReactNode
  title?: string
}

/**
 * Editable Popover：定义该模块复用的常量配置。
 * 所属模块：`packages/ui-antd/src/components/Editable.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const EditablePopover = observer(({ children, title }: EditablePopoverProps): ReactElement => {
  let field: FieldInstance | null = null
  let formPattern: string = 'editable'
  try {
    field = useField()
    formPattern = useForm().pattern
  }
  catch {
    return <>{children}</>
  }

  const [visible, setVisible] = useState(false)

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
      field.pattern = 'preview'
      setVisible(false)
    }
  }, [field])

  if (field && !visible && field.pattern === 'editable') {
    field.pattern = 'preview'
  }

  return (
    <Popover
      trigger="click"
      title={title}
      open={visible}
      onOpenChange={open => (open ? handleOpen() : handleClose())}
      content={<div style={{ minWidth: 280 }}>{children}</div>}
    >
      <div
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
    </Popover>
  )
})
