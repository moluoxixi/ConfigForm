import type { ReactElement } from 'react'
/// <reference path="./jsoneditor.d.ts" />
import { Alert, message, Modal } from 'antd'
import JSONEditor from 'jsoneditor'
import { useEffect, useRef, useState } from 'react'
import 'jsoneditor/dist/jsoneditor.css'

/**
 * JsonEditorModalProps??????
 * ???`packages/ui-antd/src/components/JsonEditorModal.tsx:8`?
 * ??????????????????????????????
 */
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

/**
 * is Record：负责“判断is Record”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Record 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Json Editor Modal：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Json Editor Modal 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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

    if (!editorHost) {
      return
    }

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

  /**
   * handleConfirm?????????????????
   * ???`packages/ui-antd/src/components/JsonEditorModal.tsx:99`?
   * ?????????????????????????????????
   * ??????????????????????????
   */
  const /**
         * handleConfirm：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/JsonEditorModal.tsx:93`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         */
    handleConfirm = async (): Promise<void> => {
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
