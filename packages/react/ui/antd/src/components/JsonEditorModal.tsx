import type { ReactElement } from 'react'
/// <reference path="./jsoneditor.d.ts" />
import { Alert, message, Modal } from 'antd'
import JSONEditor from 'jsoneditor'
import { useEffect, useRef, useState } from 'react'
import 'jsoneditor/dist/jsoneditor.css'

interface JsonEditorModalProps {
  open: boolean
  title: string
  value: Record<string, unknown> | null
  readOnly?: boolean
  confirmText?: string
  cancelText?: string
  description?: string
  onCancel: () => void
  onConfirm?: (value: Record<string, unknown>) => void | Promise<void>
  onChange?: (value: Record<string, unknown>) => void
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function JsonEditorModal({
  open,
  title,
  value,
  readOnly = false,
  confirmText = '确定',
  cancelText = '取消',
  description,
  onCancel,
  onConfirm,
  onChange,
}: JsonEditorModalProps): ReactElement {
  const [editorHost, setEditorHost] = useState<HTMLDivElement | null>(null)
  const editorRef = useRef<JSONEditor | null>(null)

  useEffect(() => {
    return () => {
      editorRef.current?.destroy()
      editorRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!open) {
      editorRef.current?.destroy()
      editorRef.current = null
      return
    }

    if (!editorHost)
      return

    if (!editorRef.current) {
      editorRef.current = new JSONEditor(editorHost, {
        mode: readOnly ? 'view' : 'tree',
        modes: readOnly ? ['view', 'code'] : ['tree', 'code'],
        mainMenuBar: true,
        navigationBar: true,
        statusBar: true,
        search: true,
        onEditable: readOnly ? () => false : undefined,
      })
    }

    const initialValue = value ?? {}
    try {
      editorRef.current.set(initialValue)
    }
    catch {
      editorRef.current.set({})
    }
  }, [editorHost, open, readOnly, value])

  const handleConfirm = async (): Promise<void> => {
    if (!editorRef.current) {
      onCancel()
      return
    }

    try {
      const nextValue = editorRef.current.get()
      if (!isRecord(nextValue)) {
        throw new Error('JSON 根节点必须是对象')
      }
      onChange?.(nextValue)
      await onConfirm?.(nextValue)
    }
    catch (error) {
      const text = error instanceof Error ? error.message : String(error)
      message.error(text || 'JSON 解析失败')
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      width={960}
      onCancel={onCancel}
      onOk={() => { void handleConfirm() }}
      okText={confirmText}
      cancelText={cancelText}
      destroyOnHidden
    >
      {description
        ? (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message={description}
            />
          )
        : null}
      <div ref={setEditorHost} style={{ minHeight: 420 }} />
    </Modal>
  )
}
